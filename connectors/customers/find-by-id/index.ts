import { ObjectId } from "mongodb";
import { collections } from "../../../plugins/connections";
import { Customer } from "../../../interfaces/customer";

export async function findCustomerById(_id: ObjectId): Promise<Customer> {
  const result: Customer = await collections.customers.findOne({ _id }) as Customer
  return result
}