import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Task } from "../../../interfaces/task"

export async function updateTask(data: Task): Promise<UpdateResult> {
  const result: UpdateResult = await collections.tasks.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}