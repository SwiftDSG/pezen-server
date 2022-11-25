import { ObjectId } from "mongodb"

export interface TransactionStatus {
  type: 'created' | 'finished'
  date: Date
}

export interface TransactionBase {
  type: 'bonus' | 'refund' | 'income' | 'withdraw'
  amount: number
  restaurant_id?: ObjectId
  user_id?: ObjectId
  order_id?: ObjectId
  status: TransactionStatus[]
  create_date: Date
}

export interface Transaction extends TransactionBase {
  _id: ObjectId
}