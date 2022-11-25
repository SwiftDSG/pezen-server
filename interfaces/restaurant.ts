import { ObjectId } from "mongodb";
import { Courier } from "./courier";
import { Finance, Position } from "./general";
import { Menu } from "./menu";

export interface RestaurantOpeningHour {
  open: string
  close: string
}

export type RestaurantType =
  'Cafe' |
  'Steakhouse' |
  'Seafood' |
  'Pastry' |
  'BBQ & Grill' |
  'Fast Food' |
  'Healthy' |
  'Traditional' |
  'Chinese' |
  'Japanese' |
  'Indonesian' |
  'Indian' |
  'Italian' |
  'Mexican' |
  'Middle Eastern' |
  'Thailand'

export interface RestaurantBody {
  name: string
  position: Position
  type: RestaurantBase['type']
  address: string
  categories: number[]
  opening_hour?: Restaurant['opening_hour']
  status?: Restaurant['status']
  member?: Restaurant['member']
}

export interface RestaurantBase {
  name: string
  code: string
  position: Position
  address: string
  formatted_address: string[]
  type: 'dine-in' | 'take-away'
  status: 'active' | 'inactive'
  categories: number[]
  opening_hour?: (RestaurantOpeningHour | 'closed' | 'opened')[]
  rating?: {
    value: number
    count: number
    score: number
  }
  price_level?: {
    value: number
    count: number
    score: number
  }
  image_url?: string
  logo_url?: string
  member: {
    _id: ObjectId
    role: 'owner' | 'cashier' | 'manager'
  }[]
  finance?: Finance
  create_date: Date
}

export interface Restaurant extends RestaurantBase {
  _id: ObjectId
}

export interface RestaurantResponse {
  position: Position
  rating: Restaurant['rating']
  finance: Restaurant['finance'],
  formatted_address: string[]
  categories: number[]
  price_level: Restaurant['price_level']
  image_url?: string
  logo_url?: string
  status: string
  opening_hour: Restaurant['opening_hour']
  members: Restaurant['member']
  name: string
  address: string
  type: string
  code: string
}

export interface RestaurantDetailResponse {
  methods: {
    'dine-in': {
      count: number
    }
    'pre-order': {
      count: number
    }
  }
  tables: { _id: string; table_number: string, capacity?: number }[]
  couriers?: Courier[]
  addresses?: {
    address: string
    distance: {
      text: string
      value: number
    }
    formatted_address: string[]
    name: string
    phone: string
    position: Position
    type: string
  }[]
}

export interface RestaurantMenusResponse {
  _id: ObjectId
  categories: {
    category: string
    menus: Menu[]
  }
}