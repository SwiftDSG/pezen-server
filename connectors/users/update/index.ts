import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { User } from "../../../interfaces/user"

export async function updateUser(data: User): Promise<UpdateResult> {
  const result: UpdateResult = await collections.users.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}