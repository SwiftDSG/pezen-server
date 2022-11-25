import { InsertOneResult, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { TaskBase, Task } from "../../../interfaces/task";

export async function createTask(data: TaskBase): Promise<InsertOneResult> {
  const payload: Task = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.tasks.insertOne(payload)
  return result
}