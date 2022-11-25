import { ObjectId } from "mongodb";
import { Order } from "../../../interfaces/order";

import { collections } from "../../../plugins/connections";

export async function getOrderCount(type: Order['type'], _id: ObjectId): Promise<number> {
  const maxDate: Date = new Date(new Date().setHours(23, 59, 59, 999))
  const minDate: Date = new Date(new Date().setHours(0, 0, 0, 0))

  const count: number = await collections.orders.countDocuments({
    type,
    restaurant_id: _id,
    create_date: {
      $gte: minDate,
      $lte: maxDate
    }
  })

  return count
}