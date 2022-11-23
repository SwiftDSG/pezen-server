import { Request, Response } from "express";
import { UpdateResult, ObjectId, InsertOneResult } from "mongodb";

import { Transaction, TransactionPayment } from "../../../interfaces/transaction";
import { findTransactionById } from "../../../connectors/transactions/find-by-id";
import { updateTransaction } from "../../../connectors/transactions/update";
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'
import { errorHandler } from "../../../plugins/errors";
import { generateDocumentNumber } from "../../../plugins/documents";
import { createDocument } from "../../../connectors/documents/create";
import { findDocumentById } from "../../../connectors/documents/find-by-id";
import { Document } from "../../../interfaces/document";

export async function transactionPutPaymentWarnController(req: Request, res: Response) {
  try {
    const {
      params: { _id },
      body: {
        document_id
      },
      user
    }: {
      body: {
        document_id: string
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

    const index: number = transaction.payment?.findIndex((a) => a.document_id[0].toString() === document_id)
    if (index === -1) throw new Error('TRANSACTION_PAYMENT_NOT_FOUND')

    const payment: TransactionPayment = transaction.payment[index]
    const paidAmount: number = payment.status.reduce((a, b) => a + b.amount, 0)

    if (paidAmount >= payment.amount) throw new Error('TRANSACTION_PAYMENT_ALREADY_FULFILLED')

    const currentDate: Date = new Date()

    const purchaseOrder: Document = await findDocumentById(transaction.document_id)
    const invoice: Document = await findDocumentById(new ObjectId(document_id))
    const warningDocumentNumber: string = await generateDocumentNumber('warning_document', transaction.branch_id)

    const { insertedId: warningDocumentId }: InsertOneResult = await createDocument({
      type: 'warning_document',
      number: warningDocumentNumber,
      create_date: currentDate,
      reference: [
        {
          _id: purchaseOrder._id,
          type: 'purchase_order',
          number: purchaseOrder.number
        },
        {
          _id: invoice._id,
          type: 'invoice',
          number: invoice.number
        }
      ]
    })

    if (!transaction.payment[index].status?.length) transaction.payment[index].status = []

    transaction.payment[index].status.push({
      document_id: [warningDocumentId],
      date: currentDate,
      user
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

    res.status(200).send(transaction._id.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}