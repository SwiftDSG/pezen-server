import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Supplier } from "../../../interfaces/supplier"

export async function updateSupplier(data: Supplier): Promise<UpdateResult> {
  const result: UpdateResult = await collections.suppliers.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}