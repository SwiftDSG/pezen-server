import { ObjectId } from "mongodb"

export interface ProductStockBase {
  product_id: ObjectId
  branch_id: ObjectId
  supplier_id?: ObjectId
  purchase_id?: ObjectId
  quantity: number
  remaining: number
  price?: number
  create_date: Date
}

export interface ProductStockBody {
  branch_id: string
  quantity: number
  price?: number
  create_date: Date
}

export interface ProductStockMin {
  _id: ObjectId
  remaining: number
  demand: number
}

export interface ProductStock extends ProductStockBase {
  _id: ObjectId
}