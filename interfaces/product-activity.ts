import { ObjectId } from "mongodb"

export type ProductActivityType = 'sale' | 'purchase' | 'replenishment' | 'reduction'

export interface ProductActivityBase {
  product_id: ObjectId
  branch_id: ObjectId
  document_id?: ObjectId
  transaction_id?: ObjectId
  type: ProductActivityType
  date: Date
  stock: {
    _id: ObjectId
    quantity: number
  }[]
  user?: {
    _id: ObjectId
    name: string
  }
}

export interface ProductActivity extends ProductActivityBase {
  _id: ObjectId
}