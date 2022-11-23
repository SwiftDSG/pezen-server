import { AggregationCursor, ObjectId, Document } from "mongodb"

import { collections } from "../../../plugins/connections"
import { TransactionPayment } from "../../../interfaces/transaction"

export async function getTransactionPayment(_id: ObjectId): Promise<TransactionPayment[]> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$_id', _id]
        }
      }
    },
    {
      $unwind: '$payment'
    },
    {
      $lookup: {
        from: 'documents',
        as: 'documents',
        let: {
          document_id: {
            $arrayElemAt: ['$payment.document_id', 0]
          }
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
              type: '$type',
              number: '$number',
              file_url: '$file_url',
            }
          }
        ]
      }
    },
    {
      $project: {
        amount: '$payment.amount',
        date: '$payment.date',
        status: '$payment.status',
        user: '$payment.user',
        document: {
          $arrayElemAt: ['$documents', 0]
        },
        paid: {
          $cond: [
            '$payment.status',
            {
              $reduce: {
                input: '$payment.status',
                initialValue: 0,
                in: {
                  $sum: ['$$value', '$$this.amount']
                }
              }
            },
            0
          ]
        }
      }
    },
    {
      $addFields: {
        finished: {
          $eq: ['$amount', '$paid']
        }
      }
    }
  ]

  const payload: TransactionPayment[] = []
  const cursor: AggregationCursor<TransactionPayment> = collections.transactions.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}