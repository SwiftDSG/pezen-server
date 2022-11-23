import { InsertOneResult, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { TransactionBase, Transaction } from "../../../interfaces/transaction";

export async function createTransaction(data: TransactionBase): Promise<InsertOneResult> {
  const payload: Transaction = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.transactions.insertOne(payload)
  return result
}