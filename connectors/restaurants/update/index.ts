import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Restaurant } from "../../../interfaces/restaurant"

export async function updateRestaurant(data: Restaurant): Promise<UpdateResult> {
  const result: UpdateResult = await collections.restaurants.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}