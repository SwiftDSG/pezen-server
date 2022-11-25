import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Order } from "../../../interfaces/order"

export async function updateOrder(data: Order): Promise<UpdateResult> {
  const result: UpdateResult = await collections.orders.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}