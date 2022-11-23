import { ObjectId } from "mongodb";

export interface BranchBase {
  name: string
  code: string
  address: string
  target?: number
}

export interface Branch extends BranchBase {
  _id: ObjectId
}

export interface BranchOverviewResponse {
  name: string
  code: string
  target?: number
  purchase?: {
    count: number
    value: number
  }
}