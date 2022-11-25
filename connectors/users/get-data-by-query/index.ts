import { AggregationCursor, Document } from "mongodb";

import { collections } from "../../../plugins/connections";

export async function getUserDataByQuery<T>(query: {
  limit: number
}, minimal?: boolean): Promise<T[]> {
  const pipeline: Document[] = []

  if (query.limit > 0) {
    pipeline.push({
      $limit: query.limit
    })
  }

  if (!minimal) {
    pipeline.push({
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

  return payload
}