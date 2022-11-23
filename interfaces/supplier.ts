import { ObjectId } from "mongodb"

interface SupplierContact {
  name: string
  email?: string
  phone?: string
  role: string
}

export interface SupplierBase {
  create_date: Date
  name: string
  address: string
  contact_person: SupplierContact[]
  email?: string
  phone?: string
}

export interface SupplierMin {
  _id: ObjectId
  name: string
}

export interface Supplier extends SupplierBase {
  _id: ObjectId
}

export interface SupplierResponse extends Supplier {
  purchase?: {
    count: number
    value: number
  }
}