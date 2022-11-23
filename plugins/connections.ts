import * as mongoDB from "mongodb"

import { Branch } from "../interfaces/branch"
import { Customer } from '../interfaces/customer'
import { Document } from "../interfaces/document"
import { Event } from '../interfaces/event'
import { ProductActivity } from '../interfaces/product-activity'
import { ProductStock } from '../interfaces/product-stock'
import { Product } from '../interfaces/product'
import { Supplier } from '../interfaces/supplier'
import { Transaction } from "../interfaces/transaction"
import { UserRole } from '../interfaces/user-role'
import { User } from '../interfaces/user'

interface Collections {
  branches?: mongoDB.Collection<Branch>
  customers?: mongoDB.Collection<Customer>
  documents?: mongoDB.Collection<Document>
  events?: mongoDB.Collection<Event>
  productActivities?: mongoDB.Collection<ProductActivity>
  productStocks?: mongoDB.Collection<ProductStock>
  products?: mongoDB.Collection<Product>
  suppliers?: mongoDB.Collection<Supplier>
  transactions?: mongoDB.Collection<Transaction>
  userRoles?: mongoDB.Collection<UserRole>
  users?: mongoDB.Collection<User>
}

export const collections: Collections = {}

export async function connectToDatabase(): Promise<void> {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017')
  await client.connect()

  const db: mongoDB.Db = client.db(process.env.MONGO_DB_NAME || 'redian-ims')

  collections.branches = db.collection<Branch>('branches')
  collections.customers = db.collection<Customer>('customers')
  collections.documents = db.collection<Document>('documents')
  collections.events = db.collection<Event>('events')
  collections.productActivities = db.collection<ProductActivity>('product-activities')
  collections.productStocks = db.collection<ProductStock>('product-stocks')
  collections.products = db.collection<Product>('products')
  collections.suppliers = db.collection<Supplier>('suppliers')
  collections.transactions = db.collection<Transaction>('transactions')
  collections.userRoles = db.collection<UserRole>('user-roles')
  collections.users = db.collection<User>('users')
}