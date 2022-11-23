import { Request, Response } from "express";

import { errorHandler } from "../../../plugins/errors";
import { ObjectId } from "mongodb";
import { getTransactionAvailableDeliveries } from "../../../connectors/transactions/get-deliveries-available";
import { TransactionDelivery } from "../../../interfaces/transaction";

export async function transactionGetAvailableDeliveriesController(req: Request, res: Response) {
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

    const deliveries: TransactionDelivery[] = await getTransactionAvailableDeliveries(new ObjectId(_id))

    res.status(200).send(deliveries)
  } catch (e) {
    errorHandler(e, res)
  }
}