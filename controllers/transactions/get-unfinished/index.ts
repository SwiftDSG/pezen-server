import { Request, Response } from "express";

import { TransactionBaseResponse } from "../../../interfaces/transaction";
import { errorHandler } from "../../../plugins/errors";
import { getTransactionsUnfinished } from "../../../connectors/transactions/get-unfinished";

export async function transactionGetUnfinishedController(req: Request, res: Response) {
  try {
    const transactions: TransactionBaseResponse[] = await getTransactionsUnfinished()

    res.status(200).send(transactions)
  } catch (e) {
    errorHandler(e, res)
  }
}