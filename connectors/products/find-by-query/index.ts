import { AggregationCursor, Document } from "mongodb";

import { collections } from "../../../plugins/connections";
import { ProductBaseResponse } from "../../../interfaces/product";

export type SortOption = 'name-ascending' | 'name-descending' | 'stock-ascending' | 'stock-descending'

export async function findProductsByQuery(query: {
  sort?: SortOption
  text?: string
  skip?: number
  limit?: number
}): Promise<ProductBaseResponse[]> {
  const pipeline: Document[] = []

  if (query.text) {
    const regex: string = query.text.split(' ').map((a) => `(${a})`).join('|')
    pipeline.push({
      $match: {
        $expr: {
          $or: [
            {
              $regexMatch: {
                input: '$name',
                options: 'i',
                regex
              }
            },
            {
              $regexMatch: {
                input: '$sku',
                options: 'i',
                regex
              }
            }
          ]
        }
      }
    })
  }

  switch (query.sort) {
    case 'name-ascending':
      pipeline.push({
        $sort: {
          name: 1
        }
      })
      break
    case 'name-descending':
      pipeline.push({
        $sort: {
          name: -1
        }
      })
      break
    case 'stock-ascending':
      pipeline.push({
        $sort: {
          stock: 1
        }
      })
      break
    case 'stock-descending':
      pipeline.push({
        $sort: {
          stock: -1
        }
      })
      break
  }

  if (query.skip) {
    pipeline.push({
      $skip: query.skip
    })
  }
  if (query.limit) {
    pipeline.push({
      $limit: query.limit
    })
  }

  pipeline.push({
    $lookup: {
      from: 'product-stocks',
      let: {
        product_id: '$_id'
      },
      as: 'stocks',
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$product_id', '$$product_id']
            }
          }
        },
        {
          $group: {
            _id: null,
            remaining: {
              $sum: '$remaining'
            }
          }
        }
      ]
    }
  }, {
    $project: {
      _id: '$_id',
      sku: '$sku',
      name: '$name',
      price: '$price',
      category: '$category',
      image_url: '$image_url',
      stock: {
        remaining: {
          $cond: [
            {
              $arrayElemAt: ['$stocks.remaining', 0]
            },
            {
              $arrayElemAt: ['$stocks.remaining', 0]
            },
            0
          ]
        }
      }
    }
  })

  const payload: ProductBaseResponse[] = []
  const cursor: AggregationCursor<ProductBaseResponse> = collections.products.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload
}