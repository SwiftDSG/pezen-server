import { ObjectId } from "mongodb"
import { ErrorMessage } from "../plugins/errors"

import { UserRoleAction } from "./user-role"

interface EventUser {
  _id: ObjectId
  role_id: ObjectId[]
  name: string
}

export interface EventBase {
  type: 'action' | 'system' | 'error'
  date: Date
  action?: UserRoleAction
  before_data?: any
  after_data?: any
  error_message?: ErrorMessage
  error_stack?: any
  user?: EventUser
}

export interface Event extends EventBase {
  _id: ObjectId
}