import { InsertOneResult, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { RestaurantBase, Restaurant } from "../../../interfaces/restaurant";

export async function createRestaurant(data: RestaurantBase): Promise<InsertOneResult> {
  const payload: Restaurant = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.restaurants.insertOne(payload)
  return result
}