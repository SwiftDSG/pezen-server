import { ObjectId } from "mongodb";

import { UserRoleAction } from './user-role'

interface UserRole {
  _id: string
  name: string
  color: string
  action: UserRoleAction[]
}

export interface UserResponse {
  _id: string
  name: string
  email: string
  phone?: string
  image_url?: string
  birth_date: Date
  create_date: Date
  role: UserRole
}

export interface UserBase {
  name: string
  email: string
  password: string
  phone?: string
  image_url?: string
  status: 'active' | 'inactive'
  birth_date: Date
  create_date: Date
}

export interface UserBody extends UserBase {
  role_id: string[]
  branch_id?: string[]
}

export interface User extends UserBase {
  _id: ObjectId
  role_id: ObjectId[]
  branch_id?: ObjectId[]
  salt: string
}

export interface UserOverview {
  _id: ObjectId
  name: string
  image_url: string
  role: UserRole[]
  sale: {
    count: number
    value: number
  }
}