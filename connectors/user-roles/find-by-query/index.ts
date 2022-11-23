import { collections } from "../../../plugins/connections";
import { UserRoleResponse } from "../../../interfaces/user-role";
import { AggregationCursor, Document } from "mongodb";

export async function findUserRolesByQuery(query: {
  skip?: number
  limit?: number
}): Promise<UserRoleResponse[]> {
  const pipeline: Document[] = [
    {
      $lookup: {
        from: 'users',
        as: 'user',
        let: {
          role_id: '$_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$$role_id', '$role_id']
              }
            }
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1
              }
            }
          }
        ]
      }
    },
    {
      $addFields: {
        count: {
          $arrayElemAt: ['$user.count', 0]
        }
      }
    },
    {
      $project: {
        user: 0
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

  const payload: UserRoleResponse[] = []
  const cursor: AggregationCursor<UserRoleResponse> = collections.userRoles.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}