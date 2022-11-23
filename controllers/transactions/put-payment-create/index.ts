import { Request, Response } from "express";
import { UpdateResult, ObjectId, InsertOneResult } from "mongodb";

import { Transaction, TransactionDelivery } from "../../../interfaces/transaction";
import { findTransactionById } from "../../../connectors/transactions/find-by-id";
import { updateTransaction } from "../../../connectors/transactions/update";
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'
import { errorHandler } from "../../../plugins/errors";
import { generateDocumentNumber } from "../../../plugins/documents";
import { createDocument } from "../../../connectors/documents/create";
import { findDocumentById } from "../../../connectors/documents/find-by-id";
import { Document } from "../../../interfaces/document";

export async function transactionPutPaymentCreateController(req: Request, res: Response) {
  try {
    const {
      params: { _id },
      body: {
        number,
        document_id,
        due_date = new Date().setHours(23, 59, 59, 999) + 2592000000,
        acknowledge_date = new Date().setHours(23, 59, 59, 999)
      },
      user
    }: {
      body: {
        number?: string
        document_id: string
        due_date: number
        acknowledge_date: number
      },
      params: {
        _id?: string
      },
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'pay-transaction')) throw new Error('UNAUTHORIZED')

    const oldTransaction: Transaction = await findTransactionById(new ObjectId(_id))
    const transaction: Transaction = { ...oldTransaction }
    if (!transaction) throw new Error('TRANSACTION_NOT_FOUND')
    if (transaction.status[0].type !== 'processing') throw new Error('TRANSACTION_NOT_PROCESSING')

    const delivery: TransactionDelivery = transaction.delivery?.find((a) => a.document_id[0].toString() === document_id)
    if (!delivery) throw new Error('TRANSACTION_DELIVERY_NOT_FOUND')

    const dueDate: Date = new Date(due_date)
    const acknowledgeDate: Date = new Date(acknowledge_date)
    if (new Date().getTime() >= dueDate.getTime())
      throw new Error('DUE_DATE_IS_NOT_VALID')
    if (new Date().getTime() >= acknowledgeDate.getTime())
      throw new Error('ACKNOWLEDGE_DATE_IS_NOT_VALID')
    if (acknowledgeDate.getTime() >= dueDate.getTime())
      throw new Error('ACKNOWLEDGE_DATE_CANNOT_BE_GREATER_THAN_DUE_DATE')

    const purchaseOrder: Document = await findDocumentById(transaction.document_id)
    const deliveryDocument: Document = await findDocumentById(new ObjectId(document_id))
    const invoiceNumber: string = transaction.type === 'sale' ? await generateDocumentNumber('invoice', transaction.branch_id) : number

    const amount: number = transaction.item.reduce((a, b): number => {
      let x: number = 0
      const index: number = delivery.item.findIndex((a) => a._id.toString() === b._id.toString())

      if (index > -1) {
        x = (b.price || 0) * delivery.item[index].quantity * (1 - (b.discount || 0))
      }

      return x + a
    }, 0)

    const { insertedId: invoiceId }: InsertOneResult = await createDocument({
      type: 'invoice',
      number: invoiceNumber,
      create_date: new Date(),
      acknowledge_date: acknowledgeDate,
      due_date: dueDate,
      reference: [
        {
          _id: purchaseOrder._id,
          type: 'purchase_order',
          number: purchaseOrder.number
        },
        {
          _id: deliveryDocument._id,
          type: 'delivery_document',
          number: deliveryDocument.number
        }
      ]
    })

    if (!transaction.payment?.length) transaction.payment = []

    transaction.payment.push({
      document_id: [invoiceId],
      amount,
      user,
      status: [],
      date: new Date()
    })

    const { modifiedCount }: UpdateResult = await updateTransaction(transaction)

    if (!modifiedCount) throw new Error('TRANSACTION_NOT_UPDATED')

    await addEvent({
      type: 'action',
      action: 'pay-transaction',
      date: new Date(),
      before_data: oldTransaction,
      after_data: transaction,
      user,
    })

    res.status(200).send(invoiceId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}