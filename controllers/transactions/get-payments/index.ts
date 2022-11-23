import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { TransactionPayment } from "../../../interfaces/transaction";
import { getTransactionPayment } from "../../../connectors/transactions/get-payments";
import { errorHandler } from "../../../plugins/errors";

export async function transactionGetPaymentsController(req: Request, res: Response) {
  try {
    const {
      params: {
        _id
      },
    }: {
      params: {
        _id?: string
      }
    } = req

    const payments: TransactionPayment[] = await getTransactionPayment(new ObjectId(_id))

    res.status(200).send(payments)
  } catch (e) {
    errorHandler(e, res)
  }
}