import { Document, AggregationCursor } from "mongodb"

import { collections } from "../../../plugins/connections"
import { TransactionBaseResponse, TransactionStatus } from "../../../interfaces/transaction"

export async function findTransactionsByQuery(query: {
  text?: string
  status?: TransactionStatus['type']
  type?: TransactionBaseResponse['type']
  start_date?: Date
  end_date?: Date
  limit?: number
  skip?: number
}): Promise<TransactionBaseResponse[]> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $and: []
        }
      }
    }
  ]

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

  pipeline.push({
    $lookup: {
      from: 'customers',
      as: 'customers',
      let: {
        subject_id: '$subject_id'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$subject_id']
            }
          }
        },
        {
          $project: {
            _id: '$_id',
            name: '$name'
          }
        }
      ]
    }
  }, {
    $lookup: {
      from: 'suppliers',
      as: 'suppliers',
      let: {
        subject_id: '$subject_id'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$subject_id']
            }
          }
        },
        {
          $project: {
            _id: '$_id',
            name: '$name'
          }
        }
      ]
    }
  }, {
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
  }, {
    $project: {
      _id: '$_id',
      total: '$total',
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
  })

  if (query.status) {
    pipeline[0].$match.$expr.$and.unshift({
      $eq: [
        { $arrayElemAt: ['$status.type', 0] },
        query.status
      ]
    })
  }
  if (query.type) {
    pipeline[0].$match.$expr.$and.unshift({
      $eq: ['$type', query.type]
    })
  }
  if (query.start_date) {
    pipeline[0].$match.$expr.$and.unshift({
      $gte: ['$create_date', query.start_date]
    })
  }
  if (query.end_date) {
    pipeline[0].$match.$expr.$and.unshift({
      $lt: ['$create_date', query.end_date]
    })
  }

  if (query.text) {
    const regex: string = `${query.text}`
    pipeline.push({
      $match: {
        $expr: {
          $regexMatch: {
            input: '$purchase_order.number',
            options: 'i',
            regex
          }
        }
      }
    })
  }

  const payload: TransactionBaseResponse[] = []
  const cursor: AggregationCursor<TransactionBaseResponse> = collections.transactions.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}