import { Document, AggregationCursor } from "mongodb"

import { collections } from "../../../plugins/connections"
import { TransactionOverview } from "../../../interfaces/transaction"

export async function getTransactionsOverview(query: {
  start_date: Date
  end_date: Date
}): Promise<TransactionOverview[]> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $and: [
            { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'waiting'] },
            { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'cancelled'] },
            { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'rejected'] },
            { $gte: ['$create_date', query.start_date] },
            { $lt: ['$create_date', query.end_date] },
          ]
        }
      }
    },
    {
      $project: {
        status: {
          $arrayElemAt: ['$status.type', 0]
        },
        type: {
          $cond: [
            { $eq: ['$type', 'sale'] },
            'income',
            'outcome'
          ]
        },
        value: '$total',
      }
    },
    {
      $group: {
        _id: '$type',
        value: {
          $sum: '$value'
        },
        count: {
          $sum: 1
        },
        processing: {
          $sum: {
            $cond: [{ $eq: ['$status', 'processing'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        type: '$_id',
        value: '$value',
        count: '$count',
        processing: '$processing'
      }
    },
    {
      $sort: {
        type: 1
      }
    }
  ]

  const payload: TransactionOverview[] = []
  const cursor: AggregationCursor<TransactionOverview> = collections.transactions.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}