import { ObjectId } from "mongodb"
import { CourierService } from "./courier-service"
import { Position } from "./general"

export interface CourierBase {
  restaurant_id: ObjectId
  name: string
  type: string
  address: string
  formatted_address: string[]
  position: Position
  services: CourierService[]
  members: {
    _id: ObjectId
    role: 'owner' | 'manager'
  }[]
  create_date: Date
}

export interface Courier extends CourierBase {
  _id: ObjectId
}