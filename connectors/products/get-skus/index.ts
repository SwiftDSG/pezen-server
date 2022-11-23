import { AggregationCursor, Document } from "mongodb";

import { ProductMin } from "../../../interfaces/product";
import { collections } from "../../../plugins/connections";

export type SortOption = 'name-ascending' | 'name-descending' | 'stock-ascending' | 'stock-descending'

export async function getProductsSkus(): Promise<ProductMin[]> {
  const pipeline: Document[] = [
    {
      $project: {
        _id: '$_id',
        sku: '$sku',
        name: '$name',
        price: '$price'
      }
    }
  ]

  const payload: ProductMin[] = []
  const cursor: AggregationCursor<ProductMin> = collections.products.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload
}