import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Transaction } from "../../../interfaces/transaction"

export async function updateTransaction(data: Transaction): Promise<UpdateResult> {
  const result: UpdateResult = await collections.transactions.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}