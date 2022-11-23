import { UpdateResult } from "mongodb";

import { collections } from "../../../plugins/connections";
import { ProductStock } from "../../../interfaces/product-stock";

export async function updateProductStock(data: ProductStock): Promise<UpdateResult> {
  const result: UpdateResult = await collections.productStocks.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}