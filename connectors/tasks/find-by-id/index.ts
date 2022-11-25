import { ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { Task } from "../../../interfaces/task";

export async function findTaskById(_id: ObjectId): Promise<Task> {
  const result: Task = await collections.tasks.findOne({ _id }) as Task
  return result
}