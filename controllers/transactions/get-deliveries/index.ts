import { Request, Response } from "express";

import { errorHandler } from "../../../plugins/errors";
import { ObjectId } from "mongodb";
import { ProductStockMin } from "../../../interfaces/product-stock";
import { getTransactionDeliveries } from "../../../connectors/transactions/get-deliveries";

export async function transactionGetDeliveriesController(req: Request, res: Response) {
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

    const products: ProductStockMin[] = await getTransactionDeliveries(new ObjectId(_id))


    res.status(200).send(products)
  } catch (e) {
    errorHandler(e, res)
  }
}