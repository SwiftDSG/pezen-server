import { ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { Task } from "../../../interfaces/task";

export async function findTaskByQuery(query: { metadata: any }): Promise<Task> {
  const result: Task = await collections.tasks.findOne({ query }) as Task
  return result
}