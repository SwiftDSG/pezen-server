import { Document, AggregationCursor } from "mongodb"

import { collections } from "../../../plugins/connections"
import { TransactionBaseResponse } from "../../../interfaces/transaction"

export async function getTransactionsUnfinished(): Promise<TransactionBaseResponse[]> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $and: [
            { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'finished'] },
            { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'cancelled'] },
            { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'rejected'] },
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'documents',
        as: 'documents',
        let: {
          document_id: '$document_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$document_id']
              }
            }
          },
          {
            $project: {
              _id: '$_id',
              type: '$type',
              number: '$number',
              file_url: '$file_url',
            }
          }
        ]
      }
    },
    {
      $sort: {
        create_date: 1
      }
    },
    {
      $project: {
        _id: '$_id',
        status: '$status',
        create_date: '$create_date',
        purchase_order: { $arrayElemAt: ['$documents', 0] },
        subject: {
          $cond: [
            { $arrayElemAt: ['$customers', 0] },
            { $arrayElemAt: ['$customers', 0] },
            { $arrayElemAt: ['$suppliers', 0] }
          ]
        },
        type: '$type',
      }
    }
  ]

  const payload: TransactionBaseResponse[] = []
  const cursor: AggregationCursor<TransactionBaseResponse> = collections.transactions.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}