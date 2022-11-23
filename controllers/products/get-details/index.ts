import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { ProductResponse } from "../../../interfaces/product";
import { getProductDataById } from "../../../connectors/products/get-data-by-id";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'

export async function productGetDetailsController(req: Request, res: Response) {
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
    if (!await verifyAction(user, 'read-product')) throw new Error('UNAUTHORIZED')

    const product: ProductResponse = await getProductDataById(new ObjectId(_id))

    res.status(200).send(product)
  } catch (e) {
    errorHandler(e, res)
  }
}