import { ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { Restaurant } from "../../../interfaces/restaurant";

export async function findRestaurantById(_id: ObjectId): Promise<Restaurant> {
  const result: Restaurant = await collections.restaurants.findOne({ _id }) as Restaurant
  return result
}