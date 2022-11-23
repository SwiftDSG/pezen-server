import { ObjectId } from "mongodb"

interface ProductStockActivityUser {
  _id: string
  name: string
}

interface ProductStockActivityTransaction {
  _id: ObjectId
  document: {
    _id: ObjectId
    number: string
  }
}

interface ProductStock {
  _id: ObjectId
  create_date: Date
  quantity: number
  remaining: number
  price?: number
}

interface ProductStockActivity {
  _id: ObjectId
  type: 'sale' | 'purchase' | 'replenishment' | 'reduction'
  quantity: number
  date: Date
  transaction?: ProductStockActivityTransaction
  user?: ProductStockActivityUser
}

export interface ProductMin {
  _id: ObjectId
  sku: string
  name: string
  price: number
}

export interface ProductBase {
  sku: string
  name: string
  price: number
  category: string
  image_url?: string[]
}

export interface Product extends ProductBase {
  _id: ObjectId
}

export interface ProductBaseResponse extends Product {
  stock: {
    remaining: number
  }
}

export interface ProductResponse extends Product {
  stock: {
    remaining: number,
    available: ProductStock[]
    activity: ProductStockActivity[]
  }
  datas?: {
    label: Date
    value: [number, number]
  }[]
}

export interface ProductOverviewResponse {
  _id: ObjectId
  name: string
  price: number
  stock: {
    remaining: number
  }
  purchase?: {
    count: number
    value: number
  },
  image_url?: string[]
}