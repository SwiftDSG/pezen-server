import { InsertOneResult, ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { ProductBase, Product } from "../../../interfaces/product"

export async function createProduct(data: ProductBase): Promise<InsertOneResult> {
  const payload: Product = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.products.insertOne(payload)
  return result
}