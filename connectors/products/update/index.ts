import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Product } from "../../../interfaces/product"

export async function updateProduct(data: Product): Promise<UpdateResult> {
  const result: UpdateResult = await collections.products.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}