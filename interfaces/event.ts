import { ObjectId } from "mongodb"
import { ErrorMessage } from "../plugins/errors"
import { UserRole } from "./user"

type EventActionUser = 'user-put'
type EventActionRestaurant = 'restaurant-post' | 'restaurant-put'

export type EventAction = EventActionUser | EventActionRestaurant

interface EventUser {
  _id: ObjectId
  role: UserRole[]
  name: string
}

export interface EventBase {
  type: 'action' | 'system' | 'error'
  date: Date
  action?: EventActionUser | EventActionRestaurant
  before_data?: any
  after_data?: any
  error_message?: ErrorMessage
  error_stack?: any
  user?: EventUser
}

export interface Event extends EventBase {
  _id: ObjectId
}