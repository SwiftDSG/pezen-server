import { InsertOneResult, ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { SupplierBase, Supplier } from "../../../interfaces/supplier"

export async function createSupplier(data: SupplierBase): Promise<InsertOneResult> {
  const payload: Supplier = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.suppliers.insertOne(payload)
  return result
}