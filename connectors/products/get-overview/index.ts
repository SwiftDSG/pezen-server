import { AggregationCursor, Document } from "mongodb"
import { ProductOverviewResponse } from "../../../interfaces/product"
import { collections } from "../../../plugins/connections"

export async function getProductsOverview(): Promise<ProductOverviewResponse[]> {
  const pipeline: Document[] = []

  pipeline.push({
    $lookup: {
      from: 'transactions',
      let: {
        product_id: '$_id'
      },
      as: 'transactions',
      pipeline: [{
        $unwind: '$item'
      }, {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$$product_id', '$item._id'] },
              { $eq: ['$type', 'sale'] },
              { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'waiting'] },
              { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'cancelled'] },
              { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'rejected'] },
            ]
          }
        }
      }, {
        $group: {
          _id: '$item._id',
          count: {
            $sum: '$item.quantity'
          },
          value: {
            $sum: {
              $multiply: ['$item.price', '$item.quantity', { $subtract: [1, { $cond: ['$item.discount', '$item.discount', 0] }] }]
            }
          }
        }
      }]
    }
  }, {
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
      name: '$name',
      price: '$price',
      image_url: '$image_url',
      purchase: {
        count: { $arrayElemAt: ['$transactions.count', 0] },
        value: { $arrayElemAt: ['$transactions.value', 0] },
      },
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
  }, {
    $sort: {
      'purchase.count': -1
    }
  })

  const payload: ProductOverviewResponse[] = []
  const cursor: AggregationCursor<ProductOverviewResponse> = collections.products.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}