import { AggregationCursor, Document } from "mongodb"
import { SupplierResponse } from "../../../interfaces/supplier"
import { collections } from "../../../plugins/connections"

export async function findSuppliersByQuery(query: {
  skip?: number
  limit?: number
}): Promise<SupplierResponse[]> {
  const pipeline: Document[] = []

  pipeline.push({
    $lookup: {
      from: 'transactions',
      let: {
        supplier_id: '$_id'
      },
      as: 'transactions',
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$type', 'purchase']
                },
                {
                  $eq: ['$subject_id', '$$supplier_id']
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1
            },
            value: {
              $sum: '$total'
            }
          }
        }
      ]
    }
  }, {
    $addFields: {
      purchase: {
        count: {
          $arrayElemAt: ['$transactions.count', 0]
        },
        value: {
          $arrayElemAt: ['$transactions.value', 0]
        },
      }
    }
  }, {
    $project: {
      transactions: 0
    }
  })

  if (query.limit) {
    pipeline.push({
      $limit: query.limit
    })
  }
  if (query.skip) {
    pipeline.push({
      $skip: query.skip
    })
  }

  const payload: SupplierResponse[] = []
  const cursor: AggregationCursor<SupplierResponse> = collections.suppliers.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}