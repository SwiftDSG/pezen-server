import { ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Product } from "../../../interfaces/product"

export async function findProductById(_id: ObjectId): Promise<Product> {
  const result: Product = await collections.products.findOne({ _id }) as Product
  return result
}