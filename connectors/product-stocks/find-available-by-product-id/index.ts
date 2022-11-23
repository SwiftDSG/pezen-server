import { AggregationCursor, ObjectId, Document } from "mongodb"

import { collections } from "../../../plugins/connections"
import { ProductStock } from "../../../interfaces/product-stock"

export async function findAvailableProductStocksByProductId(product_id: ObjectId, branch_id?: ObjectId): Promise<ProductStock[]> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $and: [
            {
              $eq: ['$product_id', product_id]
            },
            {
              $gt: ['$remaining', 0]
            }
          ]
        }
      }
    },
    {
      $sort: {
        create_date: 1
      }
    }
  ]

  if (branch_id) {
    pipeline[0].$match.$expr.$and.unshift({
      $eq: ['$branch_id', branch_id]
    })
  }

  const payload: ProductStock[] = []
  const cursor: AggregationCursor<ProductStock> = collections.productStocks.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}