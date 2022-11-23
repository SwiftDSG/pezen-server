import { AggregationCursor, Document } from "mongodb"
import { BranchOverviewResponse } from "../../../interfaces/branch"
import { collections } from "../../../plugins/connections"

export async function getBranchesOverview(query: {
  start_date: Date
  end_date: Date
}): Promise<BranchOverviewResponse[]> {
  const pipeline: Document[] = []

  pipeline.push({
    $lookup: {
      from: 'transactions',
      let: {
        branch_id: '$_id'
      },
      as: 'transactions',
      pipeline: [{
        $match: {
          $expr: {
            $and: [
              { $eq: ['$type', 'sale'] },
              { $eq: ['$branch_id', '$$branch_id'] },
              { $gte: ['$create_date', query.start_date] },
              { $lt: ['$create_date', query.end_date] },
              { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'waiting'] },
              { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'cancelled'] },
              { $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'rejected'] },
            ]
          }
        }
      }, {
        $group: {
          _id: null,
          count: {
            $sum: 1
          },
          value: {
            $sum: '$total'
          }
        }
      }]
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
  }, {
    $sort: {
      'purchase.value': -1
    }
  }, {
    $limit: 3
  })

  const payload: BranchOverviewResponse[] = []
  const cursor: AggregationCursor<BranchOverviewResponse> = collections.branches.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}