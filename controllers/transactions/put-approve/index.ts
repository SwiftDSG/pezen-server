import { Request, Response } from "express";
import { UpdateResult, ObjectId } from "mongodb";

import { Transaction } from "../../../interfaces/transaction";
import { findTransactionById } from "../../../connectors/transactions/find-by-id";
import { updateTransaction } from "../../../connectors/transactions/update";
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'
import { errorHandler } from "../../../plugins/errors";

export async function transactionPutApproveController(req: Request, res: Response) {
  try {
    const {
      params: { _id },
      user
    }: {
      params: {
        _id?: string
      },
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'approve-transaction')) throw new Error('UNAUTHORIZED')

    const oldTransaction: Transaction = await findTransactionById(new ObjectId(_id))
    const transaction: Transaction = { ...oldTransaction }
    if (!transaction) throw new Error('TRANSACTION_NOT_FOUND')
    if (transaction.status[0].type !== 'waiting') throw new Error('TRANSACTION_NOT_WAITING')

    transaction.status.unshift({
      type: 'processing',
      date: new Date(),
      user
    })

    const { modifiedCount }: UpdateResult = await updateTransaction(transaction)

    if (!modifiedCount) throw new Error('TRANSACTION_NOT_UPDATED')

    await addEvent({
      type: 'action',
      action: 'approve-transaction',
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