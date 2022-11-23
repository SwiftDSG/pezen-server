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
import { ProductStock } from "../../../interfaces/product-stock";
import { findAvailableProductStocksByProductId } from "../../../connectors/product-stocks/find-available-by-product-id";
import { updateProductStock } from "../../../connectors/product-stocks/update";
import { createProductActivity } from "../../../connectors/product-activities/create";

export async function transactionPutDeliverController(req: Request, res: Response) {
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
    if (!await verifyAction(user, 'deliver-transaction')) throw new Error('UNAUTHORIZED')

    const oldTransaction: Transaction = await findTransactionById(new ObjectId(_id))
    const transaction: Transaction = { ...oldTransaction }
    if (!transaction) throw new Error('TRANSACTION_NOT_FOUND')
    if (transaction.status[0].type !== 'processing') throw new Error('TRANSACTION_NOT_PROCESSING')

    const currentDate: Date = new Date()

    const stockPayload: { _id: ObjectId, quantity: number }[][] = []
    for (let i: number = 0; i < items.length; i++) {
      stockPayload[i] = []
      const item: { _id: string, quantity: number } = items[i]
      const availableProductStock: ProductStock[] = await findAvailableProductStocksByProductId(new ObjectId(item._id), transaction.branch_id)
      if (!availableProductStock?.length) throw new Error('STOCK_NOT_FOUND')

      const totalQuantity: number = availableProductStock.reduce((a, b) => a + b.quantity, 0)
      if (item.quantity > totalQuantity) throw new Error('STOCK_NOT_ENOUGH')

      const affectedProductStock: ProductStock[] = []
      let remaining: number = item.quantity
      let index: number = 0
      while (remaining > 0) {
        const stock: ProductStock = availableProductStock[index]
        if (stock.remaining - remaining >= 0) {
          stockPayload[i][index] = {
            _id: stock._id,
            quantity: remaining
          }
          stock.remaining -= remaining
          remaining = 0
        } else {
          stockPayload[i][index] = {
            _id: stock._id,
            quantity: stock.remaining
          }
          remaining -= stock.remaining
          stock.remaining = 0
        }
        index++
        affectedProductStock.push(stock)
      }

      for (let i: number = 0; i < availableProductStock.length; i++) {
        await updateProductStock(affectedProductStock[i])
        await addEvent({
          type: 'system',
          action: 'update-stock',
          date: currentDate,
          before_data: availableProductStock[i],
          after_data: affectedProductStock[i],
        })
      }
    }

    const deliveryDocumentNumber: string = await generateDocumentNumber('delivery_document', transaction.branch_id)

    const { insertedId: deliveryDocumentId }: InsertOneResult = await createDocument({
      type: 'delivery_document',
      number: deliveryDocumentNumber,
      create_date: currentDate
    })

    if (!transaction.delivery?.length) transaction.delivery = []
    transaction.delivery.push({
      user,
      item: items.map((a) => ({ _id: new ObjectId(a._id), quantity: a.quantity })),
      document_id: [deliveryDocumentId],
      date: currentDate
    })

    const { modifiedCount }: UpdateResult = await updateTransaction(transaction)
    if (!modifiedCount) throw new Error('TRANSACTION_NOT_UPDATED')

    for (let i: number = 0; i < items.length; i++) {
      const item: { _id: string, quantity: number } = items[i]
      await createProductActivity({
        product_id: new ObjectId(item._id),
        branch_id: transaction.branch_id,
        document_id: deliveryDocumentId,
        transaction_id: transaction._id,
        type: transaction.type,
        date: currentDate,
        stock: stockPayload[i]
      })
    }

    await addEvent({
      type: 'action',
      action: 'deliver-transaction',
      date: currentDate,
      before_data: oldTransaction,
      after_data: transaction,
      user,
    })

    res.status(200).send(transaction._id.toString())
  } catch (e) {
    console.log(e)
    errorHandler(e, res)
  }
}