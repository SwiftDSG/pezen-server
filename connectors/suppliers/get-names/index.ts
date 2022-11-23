import { AggregationCursor, Document } from "mongodb";

import { collections } from "../../../plugins/connections";

import { SupplierMin } from "../../../interfaces/supplier";

export async function getSuppliersNames(): Promise<SupplierMin[]> {
  const pipeline: Document[] = [
    {
      $project: {
        _id: '$_id',
        name: '$name'
      }
    }
  ]

  const payload: SupplierMin[] = []
  const cursor: AggregationCursor<any> = collections.suppliers.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload
}