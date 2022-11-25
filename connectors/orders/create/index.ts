import { InsertOneResult, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { OrderBase, Order } from "../../../interfaces/order";

export async function createOrder(data: OrderBase): Promise<InsertOneResult> {
  const payload: Order = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.orders.insertOne(payload)
  return result
}