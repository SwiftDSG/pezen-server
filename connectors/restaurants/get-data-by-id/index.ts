import { AggregationCursor, Document, ObjectId } from "mongodb";

import { RestaurantResponse } from "../../../interfaces/restaurant";
import { collections } from "../../../plugins/connections";

export async function getRestaurantDataById(_id: ObjectId): Promise<RestaurantResponse> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$_id', _id]
        }
      }
    }
  ]

  pipeline.push({
    $project: {
      position: '$position',
      rating: '$rating',
      finance: {
        balance_active: '$finance.balance_active',
        balance_pending: {
          $sum: '$finance.balance_pending.amount'
        }
      },
      formatted_address: '$formatted_address',
      categories: '$categories',
      price_level: '$price_level',
      image_url: '$image_url',
      logo_url: '$logo_url',
      status: '$status',
      opening_hour: '$opening_hour',
      members: '$members',
      name: '$name',
      address: '$address',
      type: '$type',
      code: '$code'
    }
  })

  const payload: RestaurantResponse[] = []
  const cursor: AggregationCursor<RestaurantResponse> = collections.restaurants.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload[0]
}