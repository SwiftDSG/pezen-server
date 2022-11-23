import { InsertOneResult, ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Branch, BranchBase } from "../../../interfaces/branch"

export async function createBranch(data: BranchBase): Promise<InsertOneResult> {
  const payload: Branch = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.branches.insertOne(payload)
  return result
}