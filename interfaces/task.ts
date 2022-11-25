import { ObjectId } from "mongodb"

export type TaskType = 'CANCEL_EMAIL_VERIFICATION' | 'CANCEL_ORDER'

export interface TaskBase {
  type: TaskType
  date: Date
  metadata?: any
}

export interface Task extends TaskBase {
  _id: ObjectId
}