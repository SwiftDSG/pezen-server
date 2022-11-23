import { InsertOneResult, ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { CustomerBase, Customer } from "../../../interfaces/customer"

export async function createCustomer(data: CustomerBase): Promise<InsertOneResult> {
  const payload: Customer = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.customers.insertOne(payload)
  return result
}