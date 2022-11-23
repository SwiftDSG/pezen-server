import { Request, Response } from "express";

import { Product } from "../../../interfaces/product";
import { findProductsByQuery, SortOption } from "../../../connectors/products/find-by-query";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'

export async function productGetSearchController(req: Request, res: Response) {
  try {
    const {
      query,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'read-product')) throw new Error('UNAUTHORIZED')

    const { sort, text, skip, limit }: {
      sort: SortOption
      text: string
      skip: string
      limit: string
    } = query

    const products: Product[] = await findProductsByQuery({
      sort, text, skip: parseInt(skip) || 0, limit: parseInt(limit) || 0
    })

    res.status(200).send(products)
  } catch (e) {
    errorHandler(e, res)
  }
}