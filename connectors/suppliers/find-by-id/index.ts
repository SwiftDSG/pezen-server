import { ObjectId } from "mongodb";
import { collections } from "../../../plugins/connections";
import { Supplier } from "../../../interfaces/supplier";

export async function findSupplierById(_id: ObjectId): Promise<Supplier> {
  const result: Supplier = await collections.suppliers.findOne({ _id }) as Supplier
  return result
}