import { DeleteResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Task } from "../../../interfaces/task"

export async function deleteTask(data: Task): Promise<DeleteResult> {
  const result: DeleteResult = await collections.tasks.deleteOne({ _id: data._id })
  return result
}