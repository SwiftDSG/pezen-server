import { AggregationCursor, ObjectId, Document } from "mongodb"

import { collections } from "../../../plugins/connections"
import { ProductStockMin } from "../../../interfaces/product-stock"

export async function getTransactionDeliveries(_id: ObjectId): Promise<ProductStockMin[]> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$_id', _id]
        }
      }
    },
    {
      $project: {
        _id: 0,
        item: '$item',
        branch_id: '$branch_id',
        delivery: {
          $reduce: {
            input: '$delivery',
            initialValue: [],
            in: {
              $concatArrays: ['$$value', '$$this.item']
            }
          }
        }
      }
    },
    {
      $unwind: '$item'
    },
    {
      $project: {
        _id: '$item._id',
        quantity: '$item.quantity',
        branch_id: '$branch_id',
        delivery: '$delivery'
      }
    },
    {
      $lookup: {
        from: 'product-stocks',
        let: {
          product_id: '$_id',
          branch_id: '$branch_id'
        },
        as: 'stocks',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$product_id', '$$product_id']
                  },
                  {
                    $eq: ['$branch_id', '$$branch_id']
                  },
                  {
                    $gt: ['$remaining', 0]
                  }
                ]
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
    },
    {
      $project: {
        _id: '$_id',
        remaining: {
          $arrayElemAt: ['$stocks.remaining', 0]
        },
        delivery: '$delivery',
        demand: {
          $cond: [
            {
              $arrayElemAt: ['$delivery', 0]
            },
            {
              $reduce: {
                input: '$delivery',
                initialValue: '$quantity',
                in: {
                  $subtract: ['$$value', {
                    $cond: [
                      { $eq: ['$_id', '$$this._id'] },
                      '$$this.quantity',
                      0
                    ]
                  }]
                }
              }
            },
            '$quantity'
          ]
        }
      }
    }
  ]

  const payload: ProductStockMin[] = []
  const cursor: AggregationCursor<ProductStockMin> = collections.transactions.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}