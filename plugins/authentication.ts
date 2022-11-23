import { Request } from "express";
import { UserRoleAction, UserRole } from "../interfaces/user-role";

import { findUserRoleById } from "../connectors/user-roles/find-by-id";

export async function verifyAction(user: Request['user'], action: UserRoleAction): Promise<boolean> {
  for (const role_id of user?.role_id || []) {
    const role: UserRole = await findUserRoleById(role_id)
    if (role?.action.includes('all') || role?.action.includes(action)) return true
  }
  return false
}