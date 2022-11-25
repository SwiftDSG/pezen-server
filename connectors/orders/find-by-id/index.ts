import { ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { Order } from "../../../interfaces/order";

export async function findOrderById(_id: ObjectId): Promise<Order> {
  const result: Order = await collections.orders.findOne({ _id }) as Order
  return result
}