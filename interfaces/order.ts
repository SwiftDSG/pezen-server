import { ObjectId } from "mongodb"

import { Address } from "./general"

export interface OrderStatus {
  type: 'unpaid' | 'unconfirmed' | 'on-going' | 'cancelled' | 'rejected' | 'finished' | 'ignored'
  date: Date
  exp_date?: Date
}

export interface OrderTable {
  _id: ObjectId
  name: string
}
export interface OrderItem {
  _id: ObjectId
  name: string
  quantity: number
  price: number
  discount: number
  make_duration?: number
  code?: string
  note?: string
  take_away?: boolean
  image_url?: string
}
export interface OrderDelivery {
  code: string
  delivery_date: Date
  type: 'car' | 'bike'
  name: string
  address: Address
}

export interface OrderBase {
  restaurant_id: ObjectId
  user_id: ObjectId
  event_id?: ObjectId
  type: 'pre-order' | 'dine-in' | 'booking'
  number: string
  payment: any
  status: OrderStatus[]
  item: OrderItem[]
  deliery?: OrderDelivery[]
  table?: OrderTable[]
  guest?: number
  pickup_date?: Date
  create_date: Date
}

export interface Order extends OrderBase {
  _id: ObjectId
}