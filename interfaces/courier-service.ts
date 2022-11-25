import { ObjectId } from "mongodb"

export interface CourierServiceBase {
  courier_id: ObjectId
  name: string
  price: number
  distance: {
    max: number
    increment?: {
      price: number
      threshold: number
      value: number
    }
  }
  weight: {
    max: number
    increment?: {
      price: number
      threshold: number
      value: number
    }
  }
  type: 'bike' | 'car'
}

export interface CourierService {
  _id: ObjectId
}