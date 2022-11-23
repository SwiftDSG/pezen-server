import { Document, AggregationCursor } from "mongodb"

import { collections } from "../../../plugins/connections"
import { UserOverview } from "../../../interfaces/user"

export async function getUsersOverview(query: {
  start_date: Date
  end_date: Date
}): Promise<UserOverview[]> {
  const pipeline: Document[] = [
    {
      $lookup: {
        from: 'transactions',
        as: 'transactions',
        let: {
          user_id: '$_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$type', 'sale']
                  },
                  {
                    $eq: [
                      {
                        $arrayElemAt: [{
                          $reverseArray: '$status.user._id'
                        }, 0]
                      },
                      '$$user_id'
                    ]
                  },
                  {
                    $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'rejected']
                  },
                  {
                    $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'cancelled']
                  },
                  {
                    $ne: [{ $arrayElemAt: ['$status.type', 0] }, 'waiting']
                  },
                  { $gte: ['$create_date', query.start_date] },
                  { $lt: ['$create_date', query.end_date] },
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              value: {
                $sum: '$total'
              },
              count: {
                $sum: 1
              }
            }
          },
          {
            $project: {
              _id: 0,
              sale: {
                value: '$value',
                count: '$count'
              }
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'user-roles',
        as: 'roles',
        let: {
          role_id: '$role_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', '$$role_id']
              }
            }
          }
        ]
      }
    },
    {
      $project: {
        name: '$name',
        role: '$roles',
        image_url: '$image_url',
        sale: { $arrayElemAt: ['$transactions.sale', 0] }
      }
    }
  ]

  const payload: UserOverview[] = []
  const cursor: AggregationCursor<UserOverview> = collections.users.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}