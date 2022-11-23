import { Request, Response } from "express";

import { getProductsCategories } from "../../../connectors/products/get-categories";
import { errorHandler } from "../../../plugins/errors";

export async function productGetCategoriesController(req: Request, res: Response) {
  try {
    const categories: string[] = await getProductsCategories()

    res.status(200).send(categories)
  } catch (e) {
    errorHandler(e, res)
  }
}