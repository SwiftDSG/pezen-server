import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Customer } from "../../../interfaces/customer"

export async function updateCustomer(data: Customer): Promise<UpdateResult> {
  const result: UpdateResult = await collections.customers.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}