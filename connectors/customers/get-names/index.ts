import { AggregationCursor, Document } from "mongodb";

import { collections } from "../../../plugins/connections";

import { CustomerMin } from "../../../interfaces/customer";

export async function getCustomersNames(): Promise<CustomerMin[]> {
  const pipeline: Document[] = [
    {
      $project: {
        _id: '$_id',
        name: '$name'
      }
    }
  ]

  const payload: CustomerMin[] = []
  const cursor: AggregationCursor<any> = collections.customers.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload
}