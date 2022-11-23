import { InsertOneResult, ObjectId } from "mongodb";
import { randomBytes, pbkdf2Sync } from "crypto";

import { collections } from "../../../plugins/connections";
import { UserBase, User } from "../../../interfaces/user";

export async function createUser(data: UserBase, role_id: ObjectId[], branch_id?: ObjectId[]): Promise<InsertOneResult> {
  const salt = randomBytes(16).toString('hex')

  const payload: User = {
    ...data,
    salt,
    role_id,
    branch_id,
    password: pbkdf2Sync(data.password, salt, 1000, 64, 'sha512').toString('hex'),
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.users.insertOne(payload)
  return result
}