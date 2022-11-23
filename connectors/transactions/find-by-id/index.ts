import { ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Transaction } from "../../../interfaces/transaction"

export async function findTransactionById(_id: ObjectId): Promise<Transaction> {
  const result: Transaction = await collections.transactions.findOne({ _id }) as Transaction
  return result
}