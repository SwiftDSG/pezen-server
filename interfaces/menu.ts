import { ObjectId } from "mongodb"

export interface MenuBase {
  restaurant_id: ObjectId
  type: 'regular' | 'dine-in' | 'pre-order'
  name: string
  seller_price: number
  markup_price: number
  category: string
  description: string
  status: 'active' | 'incative'
  portion: number
  make_duration: number
  image_url: string
  create_date: Date
  stock?: number
}

export interface Menu extends MenuBase {
  _id: ObjectId
}