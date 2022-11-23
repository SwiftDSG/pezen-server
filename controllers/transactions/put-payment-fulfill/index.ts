import { Request, Response } from "express";
import { ObjectId, UpdateResult } from "mongodb";

import { Transaction, TransactionPaymentStatus } from "../../../interfaces/transaction";
import { findTransactionById } from "../../../connectors/transactions/find-by-id";
import { transactionsFileHandler } from "../../../plugins/multipart";
import { errorHandler } from "../../../plugins/errors";
import { updateTransaction } from "../../../connectors/transactions/update";
import { addEvent } from "../../../plugins/events";
import { verifyAction } from "../../../plugins/authentication";

export async function transactionPutPaymentFulFillController(req: Request, res: Response) {
  try {
    await transactionsFileHandler(req, res)
    const {
      params: { _id },
      body: {
        document_id,
        amount
      },
      files,
      user
    }: {
      params: {
        _id?: string
      },
      body: {
        document_id: string
        amount: string
      },
      files?: Request['files'],
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'pay-transaction')) throw new Error('UNAUTHORIZED')

    const oldTransaction: Transaction = await findTransactionById(new ObjectId(_id))
    const transaction: Transaction = { ...oldTransaction }
    if (!transaction) throw new Error('TRANSACTION_NOT_FOUND')

    const index: number = transaction.payment?.findIndex((a) => a.document_id[0].toString() === document_id)
    if (index === -1) throw new Error('TRANSACTION_PAYMENT_NOT_FOUND')

    let transactionFinished: boolean = false
    const parsedAmount: number = parseInt(amount)
    const paidAmount: number = transaction.payment.reduce((a, b) => a + b.status.reduce((c, d) => c + (d.amount || 0), 0), 0)

    if (paidAmount + parsedAmount >= transaction.total) transactionFinished = true

    const payload: TransactionPaymentStatus = {
      date: new Date(),
      amount: parsedAmount,
      user
    }

    if (files?.length) {
      for (let i: number = 0; i < files.length; i++) {
        const file: Express.Multer.File = files[i]
        if (file.originalname.includes('payment_document')) {
          payload.file_url = `/transactions/${_id}/${file.filename}`
        }
      }
    }

    transaction.payment[index].status.unshift(payload)

    if (transactionFinished) {
      transaction.status.unshift({
        type: 'finished',
        date: new Date(),
        user
      })
    }

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