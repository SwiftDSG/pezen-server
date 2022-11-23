import { ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { User } from "../../../interfaces/user";

export async function findUserById(_id: ObjectId): Promise<User> {
  const result: User = await collections.users.findOne({ _id }) as User
  return result
}