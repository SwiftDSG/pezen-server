import { AggregationCursor, Document, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";

export async function getUserDataById<T>(_id: ObjectId, minimal?: boolean): Promise<T> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$_id', _id]
        }
      }
    },
  ]

  if (!minimal) {
    pipeline.push({
      $project: {
        _id: '$_id',
        name: '$name',
        email: '$email',
        phone: '$phone',
        image_url: '$image_url',
        address: '$address',
        birth_date: '$birth_date',
        create_date: '$create_date',
        role: '$role',
      }
    })
  } else {
    pipeline.push({
      $project: {
        _id: '$_id',
        name: '$name',
        image_url: '$image_url',
        role: '$role',
      }
    })
  }

  const payload: T[] = []
  const cursor: AggregationCursor<T> = collections.users.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload[0]
}