import { collections } from "../../../plugins/connections";
import { User } from "../../../interfaces/user";
import { AggregationCursor, Document } from "mongodb";

export async function findUsersByQuery(query: {
  text?: string
  skip?: number
  limit?: number
}): Promise<User[]> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $and: []
        }
      }
    }
  ]

  pipeline.push({
    $lookup: {
      from: 'branches',
      let: {
        branch_id: '$branch_id'
      },
      as: 'branch',
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', '$$branch_id']
            }
          }
        }
      ]
    }
  }, {
    $addFields: {
      branch: {
        $map: {
          input: '$branch',
          in: {
            _id: '$$this._id',
            name: '$$this.name',
            code: '$$this.code'
          }
        }
      }
    }
  }, {
    $lookup: {
      from: 'user-roles',
      as: 'role',
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
  }, {
    $project: {
      branch_id: 0,
      role_id: 0,
      password: 0,
      salt: 0
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

  const payload: User[] = []
  const cursor: AggregationCursor<User> = collections.users.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}