import { Request, Response } from "express";
import { ObjectId, UpdateResult } from "mongodb";

import { Transaction } from "../../../interfaces/transaction";
import { findTransactionById } from "../../../connectors/transactions/find-by-id";
import { errorHandler } from "../../../plugins/errors";
import { updateTransaction } from "../../../connectors/transactions/update";
import { addEvent } from "../../../plugins/events";
import { verifyAction } from "../../../plugins/authentication";

export async function transactionPutCancelController(req: Request, res: Response) {
  try {
    const {
      params: { _id },
      body: {
        message
      },
      user
    }: {
      params: {
        _id?: string
      },
      body: {
        message: string
      },
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'cancel-transaction')) throw new Error('UNAUTHORIZED')

    const oldTransaction: Transaction = await findTransactionById(new ObjectId(_id))
    const transaction: Transaction = { ...oldTransaction }
    if (!transaction) throw new Error('TRANSACTION_NOT_FOUND')

    transaction.status.unshift({
      type: transaction.status[0].type === 'waiting' ? 'rejected' : 'cancelled',
      date: new Date(),
      user,
      message
    })

    const { modifiedCount }: UpdateResult = await updateTransaction(transaction)

    if (!modifiedCount) throw new Error('TRANSACTION_NOT_UPDATED')

    await addEvent({
      type: 'action',
      action: 'cancel-transaction',
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