import { Request, Response } from "express";

import { TransactionBaseResponse, TransactionStatus } from "../../../interfaces/transaction";
import { findTransactionsByQuery } from "../../../connectors/transactions/find-by-query";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'

export async function transactionGetSearchController(req: Request, res: Response) {
  try {
    const {
      query: rawQuery,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-transaction')) throw new Error('UNAUTHORIZED')
    const { text, status, type, limit, skip, start_date, end_date }: {
      text?: string
      status?: TransactionStatus['type']
      type?: TransactionBaseResponse['type']
      start_date?: string
      end_date?: string
      limit?: number
      skip?: number
    } = rawQuery

    const query: {
      text?: string
      status?: TransactionStatus['type']
      type?: TransactionBaseResponse['type']
      start_date?: Date
      end_date?: Date
      limit?: number
      skip?: number
    } = {
      text,
      status,
      type,
      limit,
      skip,
    }

    if (start_date) query.start_date = new Date(parseInt(start_date))
    if (end_date) query.end_date = new Date(parseInt(end_date))

    const transactions: TransactionBaseResponse[] = await findTransactionsByQuery(query)

    res.status(200).send(transactions)
  } catch (e) {
    errorHandler(e, res)
  }
}