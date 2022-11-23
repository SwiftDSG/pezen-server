import { ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { Branch } from "../../../interfaces/branch";

export async function findBranchById(_id: ObjectId): Promise<Branch> {
  const result: Branch = await collections.branches.findOne({ _id }) as Branch
  return result
}