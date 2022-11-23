import { collections } from "../../../plugins/connections";
import { User } from "../../../interfaces/user";

export async function findUserByEmail(email: string): Promise<User> {
  const result: User = await collections.users.findOne({ email }) as User
  return result
}