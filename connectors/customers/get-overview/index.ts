import { AggregationCursor, Document } from "mongodb"
import { CustomerResponse } from "../../../interfaces/customer"
import { collections } from "../../../plugins/connections"

export async function getCustomersOverview(): Promise<CustomerResponse[]> {
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
  },
    {
      $sort: {
        'purchase.value': -1
      }
    },
    {
      $limit: 3
    })

  const payload: CustomerResponse[] = []
  const cursor: AggregationCursor<CustomerResponse> = collections.customers.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}