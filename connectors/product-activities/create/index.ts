import { InsertOneResult, ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { ProductActivityBase, ProductActivity } from "../../../interfaces/product-activity"

export async function createProductActivity(data: ProductActivityBase): Promise<InsertOneResult> {
  const payload: ProductActivity = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.productActivities.insertOne(payload)
  return result
}