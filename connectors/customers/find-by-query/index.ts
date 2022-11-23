import { AggregationCursor, Document } from "mongodb"
import { CustomerResponse } from "../../../interfaces/customer"
import { collections } from "../../../plugins/connections"

export async function findCustomersByQuery(query: {
  skip?: number
  limit?: number
}): Promise<CustomerResponse[]> {
  const pipeline: Document[] = []

  pipeline.push({
    $lookup: {
      from: 'transactions',
      let: {
        customer_id: '$_id'
      },
      as: 'transactions',
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$type', 'sale']
                },
                {
                  $eq: ['$subject_id', '$$customer_id']
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

  const payload: CustomerResponse[] = []
  const cursor: AggregationCursor<CustomerResponse> = collections.customers.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}