import { ObjectId } from "mongodb"

export interface Position {
  type: ['Point'],
  coordinates: [number, number]
}
export interface Address {
  position: Position
  address: string
  formatted_address?: string[]
  label?: string
  type?: string
  phone?: string
  name?: string
}

export interface Subscription {
  endpoint: string
  uuid: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface FinanceBalancePending {
  amount: number
  transaction_id: ObjectId
  date: Date
}
export interface FinancePayoutAddress {
  name: string
  bank: string
  account: string
  alias_name: string
}
export interface Finance {
  balance_active: number
  balance_pending: FinanceBalancePending[]
  payout_address: FinancePayoutAddress[]
}