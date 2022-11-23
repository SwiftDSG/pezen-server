import { Request, Response } from "express";
import { UpdateResult, ObjectId, InsertOneResult } from "mongodb";

import { Transaction } from "../../../interfaces/transaction";
import { findTransactionById } from "../../../connectors/transactions/find-by-id";
import { updateTransaction } from "../../../connectors/transactions/update";
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'
import { errorHandler } from "../../../plugins/errors";
import { generateDocumentNumber } from "../../../plugins/documents";
import { createDocument } from "../../../connectors/documents/create";
import { ProductStockBase } from "../../../interfaces/product-stock";
import { createProductActivity } from "../../../connectors/product-activities/create";
import { createProductStock } from "../../../connectors/product-stocks/create";

export async function transactionPutReceiveController(req: Request, res: Response) {
  try {
    const {
      params: { _id },
      body: {
        items,
      },
      user
    }: {
      body: {
        items: {
          _id: string,
          quantity: number
        }[]
      },
      params: {
        _id?: string
      },
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'receive-transaction')) throw new Error('UNAUTHORIZED')

    const oldTransaction: Transaction = await findTransactionById(new ObjectId(_id))
    const transaction: Transaction = { ...oldTransaction }
    if (!transaction) throw new Error('TRANSACTION_NOT_FOUND')
    if (transaction.status[0].type !== 'processing') throw new Error('TRANSACTION_NOT_PROCESSING')

    const currentDate: Date = new Date()

    const stockPayload: { _id: ObjectId, quantity: number }[][] = []
    for (let i: number = 0; i < items.length; i++) {
      stockPayload[i] = []
      const item: ProductStockBase = {
        product_id: new ObjectId(items[i]._id),
        branch_id: transaction.branch_id,
        purchase_id: transaction._id,
        supplier_id: transaction.subject_id,
        quantity: items[i].quantity,
        remaining: items[i].quantity,
        create_date: currentDate
      }

      const index: number = transaction.item.findIndex((a) => a._id.toString() === item.product_id.toString())
      item.price = transaction.item[index].price

      const { insertedId: newStockId }: InsertOneResult = await createProductStock(item)

      await addEvent({
        type: 'system',
        action: 'create-stock',
        date: currentDate,
        after_data: {
          ...item,
          _id: newStockId
        },
      })

      stockPayload[i].push({
        _id: newStockId,
        quantity: item.quantity
      })
    }

    const acceptanceDocumentNumber: string = await generateDocumentNumber('acceptance_document', transaction.branch_id)

    const { insertedId: acceptanceDocumentId }: InsertOneResult = await createDocument({
      type: 'acceptance_document',
      number: acceptanceDocumentNumber,
      create_date: currentDate
    })

    if (!transaction.delivery?.length) transaction.delivery = []
    transaction.delivery.push({
      user,
      item: items.map((a) => ({ _id: new ObjectId(a._id), quantity: a.quantity })),
      document_id: [acceptanceDocumentId],
      date: currentDate
    })

    const { modifiedCount }: UpdateResult = await updateTransaction(transaction)
    if (!modifiedCount) throw new Error('TRANSACTION_NOT_UPDATED')

    for (let i: number = 0; i < items.length; i++) {
      const item: { _id: string, quantity: number } = items[i]
      await createProductActivity({
        product_id: new ObjectId(item._id),
        branch_id: transaction.branch_id,
        document_id: acceptanceDocumentId,
        transaction_id: transaction._id,
        type: transaction.type,
        date: currentDate,
        stock: stockPayload[i]
      })
    }

    await addEvent({
      type: 'action',
      action: 'receive-transaction',
      date: currentDate,
      before_data: oldTransaction,
      after_data: transaction,
      user,
    })

    res.status(200).send(transaction._id.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}