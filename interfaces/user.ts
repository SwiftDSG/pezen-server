import { ObjectId } from "mongodb";
import { Address, Finance } from "./general";

export type UserRole = 'user' | 'restaurant'

export interface UserBody {
  name: string
  email: string
  password: string
  birth_date?: Date
  phone?: string
  address: Address[]
}

export interface UserBase {
  restaurant_id?: ObjectId[]
  role: UserRole[]
  name: string
  email: string
  password: string
  phone?: string
  image_url?: string
  address?: Address[]
  finance?: Finance
  birth_date?: Date
  create_date: Date
}

export interface User extends UserBase {
  _id: ObjectId
  salt: string
}

export interface UserResponse {
  restaurant_id?: ObjectId[]
  role: UserRole[]
  name: string
  email: string
  phone?: string
  image_url?: string
  address?: Address[]
  finance?: Finance
  birth_date?: Date
  create_date: Date
}

export interface UserMinResponse {
  _id: string
  name: string
  email: string
  role: string
  image_url?: string
}