import { InsertOneResult, ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { ProductStockBase, ProductStock } from "../../../interfaces/product-stock"

export async function createProductStock(data: ProductStockBase): Promise<InsertOneResult> {
  const payload: ProductStock = {
    ...data,
    _id: new ObjectId()
  }

  const result: InsertOneResult = await collections.productStocks.insertOne(payload)
  return result
}