import * as mongoDB from "mongodb"

import { Event } from "../interfaces/event"
import { Menu } from "../interfaces/menu"
import { Order } from "../interfaces/order"
import { Restaurant } from "../interfaces/restaurant"
import { Task } from "../interfaces/task"
import { Transaction } from "../interfaces/transaction"
import { User } from '../interfaces/user'

interface Collections {
  events?: mongoDB.Collection<Event>
  menus?: mongoDB.Collection<Menu>
  orders?: mongoDB.Collection<Order>
  restaurants?: mongoDB.Collection<Restaurant>
  tasks?: mongoDB.Collection<Task>
  transactions?: mongoDB.Collection<Transaction>
  users?: mongoDB.Collection<User>
}

export const collections: Collections = {}

export async function connectToDatabase(): Promise<void> {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017')
  await client.connect()

  const db: mongoDB.Db = client.db(process.env.MONGO_DB_NAME || 'redian-ims')

  collections.events = db.collection<Event>('events')
  collections.menus = db.collection<Menu>('menus')
  collections.orders = db.collection<Order>('orders')
  collections.restaurants = db.collection<Restaurant>('restaurants')
  collections.tasks = db.collection<Task>('tasks')
  collections.transactions = db.collection<Transaction>('transactions')
  collections.users = db.collection<User>('users')
}