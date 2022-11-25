import { AggregationCursor, Document } from "mongodb";
import { Task } from "../../../interfaces/task";

import { collections } from "../../../plugins/connections";

export async function getTaskExpired(): Promise<Task[]> {
  const pipeline: Document[] = [
    {
      $match: {
        date: { $lt: new Date() }
      }
    }
  ]

  const payload: Task[] = []
  const cursor: AggregationCursor<Task> = collections.tasks.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload
}