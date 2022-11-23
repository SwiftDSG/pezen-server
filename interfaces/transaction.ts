import { ObjectId } from "mongodb"
import { Request } from 'express'

import { Document } from './document'

export interface TransactionPaymentStatus {
  document_id?: ObjectId[]
  file_url?: string
  amount?: number
  date: Date
  user: Request['user']
}

export interface TransactionPayment {
  document_id?: ObjectId[]
  amount: number
  paid?: number
  date: Date
  status: TransactionPaymentStatus[]
  user: Request['user']
  document?: TransactionDocument
  finished?: boolean
}

interface TransactionSubject {
  _id: ObjectId
  name: string
}

interface TransactionDocument {
  _id: ObjectId
  type: Document['type']
  number: string
  file_url?: string
}

export interface TransactionDeliveryItem {
  _id: ObjectId
  quantity: number
}

export interface TransactionDelivery {
  document_id: ObjectId[]
  item: TransactionDeliveryItem[]
  user: Request['user']
  date: Date
}

interface TransactionActivity {
  type: 'status' | 'delivery' | 'payment'
  date: Date
  user?: Request['user']
  document?: TransactionDocument[]
  status_type?: TransactionStatus['type']
}

export interface TransactionItem {
  _id: ObjectId
  quantity: number
  name?: string
  price?: number
  discount?: number
}

export interface TransactionStatus {
  type: 'waiting' | 'processing' | 'finished' | 'rejected' | 'cancelled'
  user: Request['user']
  date: Date
  message?: string
}

export interface TransactionBody {
  type: TransactionBase['type']
  item: TransactionItem[]
  tax: number
  subject_id: string
  branch_id: string
  purchase_order?: string
}

export interface TransactionBaseResponse {
  _id: ObjectId
  total: number
  subject: TransactionSubject
  status: TransactionStatus
  purchase_order: TransactionDocument
  create_date: Date
  type: TransactionBase['type']
}

export interface TransactionResponse {
  _id: ObjectId
  branch_id: ObjectId
  type: TransactionBase['type']
  sub_total: number
  total: number
  tax: number
  subject: TransactionSubject
  purchase_order: TransactionDocument
  item: TransactionItem[]
  status: TransactionStatus[]
  activity: TransactionActivity[]
  create_date: Date
}

export interface TransactionBase {
  subject_id: ObjectId
  document_id: ObjectId
  branch_id: ObjectId
  type: 'purchase' | 'sale'
  sub_total: number
  total: number
  tax: number
  item: TransactionItem[]
  status: TransactionStatus[]
  delivery?: TransactionDelivery[]
  payment?: TransactionPayment[]
  create_date: Date
}

export interface Transaction extends TransactionBase {
  _id: ObjectId
}

export interface TransactionOverview {
  type: 'income' | 'outcome' | 'profit'
  value: number
  count?: number
  processing?: number
}