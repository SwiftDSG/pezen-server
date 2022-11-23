import { Request } from "express"
import { ObjectId } from "mongodb"

interface CustomerNote {
  title: string
  message: string
  user: Request['user']
}

interface CustomerContact {
  name: string
  email?: string
  phone?: string
  role: string
}

export interface CustomerBase {
  create_date: Date
  name: string
  address: string
  contact_person: CustomerContact[]
  email?: string
  phone?: string
  note?: CustomerNote[]
}

export interface CustomerMin {
  _id: ObjectId
  name: string
}

export interface Customer extends CustomerBase {
  _id: ObjectId
}

export interface CustomerResponse extends Customer {
  purchase?: {
    count: number
    value: number
  }
}