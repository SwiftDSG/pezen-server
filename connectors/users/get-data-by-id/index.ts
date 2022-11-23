import { AggregationCursor, Document, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { UserResponse } from "../../../interfaces/user";

export async function getUserDataById(_id: ObjectId): Promise<UserResponse> {

  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$_id', _id]
        }
      }
    },
    {
      $lookup: {
        from: 'user-roles',
        let: {
          role_id: '$role_id'
        },
        as: 'role',
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
        _id: '$_id',
        name: '$name',
        email: '$email',
        phone: '$phone',
        image_url: '$image_url',
        birth_date: '$birth_date',
        create_date: '$create_date',
        role: '$role',
      }
    }
  ]

  const payload: UserResponse[] = []
  const cursor: AggregationCursor<UserResponse> = collections.users.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload[0]
}