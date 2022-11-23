import { Request, Response } from "express";

import { ProductMin } from "../../../interfaces/product";
import { getProductsSkus } from "../../../connectors/products/get-skus";
import { errorHandler } from "../../../plugins/errors";

export async function productGetSkusController(req: Request, res: Response) {
  try {
    const skus: ProductMin[] = await getProductsSkus()

    res.status(200).send(skus)
  } catch (e) {
    errorHandler(e, res)
  }
}