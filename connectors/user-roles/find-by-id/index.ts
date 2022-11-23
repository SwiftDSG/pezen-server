import { ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { UserRole } from "../../../interfaces/user-role";

export async function findUserRoleById(_id: ObjectId): Promise<UserRole> {
  const result: UserRole = await collections.userRoles.findOne({ _id }) as UserRole
  return result
}