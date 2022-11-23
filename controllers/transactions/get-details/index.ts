import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { TransactionResponse } from "../../../interfaces/transaction";
import { getTransactionDataById } from "../../../connectors/transactions/get-data-by-id";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'

export async function transactionGetDetailsController(req: Request, res: Response) {
  try {
    const {
      params: {
        _id
      },
      user
    }: {
      params: {
        _id?: string
      },
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'read-transaction')) throw new Error('UNAUTHORIZED')

    const transaction: TransactionResponse = await getTransactionDataById(new ObjectId(_id))

    res.status(200).send(transaction)
  } catch (e) {
    errorHandler(e, res)
  }
}