import { AggregationCursor, Document } from "mongodb";

import { collections } from "../../../plugins/connections";

export async function getProductsCategories(): Promise<string[]> {
  const pipeline: Document[] = [
    {
      $group: {
        _id: '$category',
      }
    }
  ]

  const payload: string[] = []
  const cursor: AggregationCursor<any> = collections.products.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc._id)
  }

  return payload
}