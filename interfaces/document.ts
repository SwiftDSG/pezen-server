import { ObjectId } from "mongodb"

export interface DocumentReference {
  _id: ObjectId
  type: DocumentBase['type']
  number: string
}

export interface DocumentBase {
  type: 'purchase_order' | 'delivery_document' | 'acceptance_document' | 'warning_document' | 'invoice' | 'tax_invoice'
  number: string
  reference?: DocumentReference[]
  file_url?: string
  acknowledge_date?: Date
  due_date?: Date
  create_date: Date
}

export interface Document extends DocumentBase {
  _id: ObjectId
}