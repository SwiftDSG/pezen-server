import { InsertOneResult, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { UserRoleBase, UserRole } from "../../../interfaces/user-role";

export async function createUserRole(data: UserRoleBase): Promise<InsertOneResult> {
  const payload: UserRole = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.userRoles.insertOne(payload)
  return result
}