import express, { Express, Request, Response, NextFunction, json, urlencoded } from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import cookie from 'cookie-parser'
import path from 'path'

import { connectToDatabase } from './plugins/connections'
import { verifyAccessToken } from './plugins/tokens'

import branchesRouter from './apis/branches'
import customersRouter from './apis/customers'
import productStocksRouter from './apis/product-stocks'
import productsRouter from './apis/products'
import userRolesRouter from './apis/user-roles'
import suppliersRouter from './apis/suppliers'
import transactionsRouter from './apis/transactions'
import usersRouter from './apis/users'
import mainRouter from './apis/main'

dotenv.config()

const app: Express = express()
const port: number = 8000

const allowedURL: string[] = [process.env.CLIENT_URL || 'http://localhost:3000']

app
  .use(cors({
    origin: allowedURL,
    credentials: true
  }))
  .use(helmet())
  .use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
  .use(cookie())
  .use(json())
  .use(urlencoded({ extended: false }))
  .use((req: Request, res: Response, next: NextFunction): void => {
    try {
      const bearerHeader: string = req.headers['authorization']
      const bearerToken: string = bearerHeader?.split(' ')[1]
      if (!bearerToken) throw new Error('UNAVAILABLE_TOKEN')
      const user: Request['user'] = verifyAccessToken(bearerToken)
      Object.assign(req, { user })
      next()
    } catch {
      next()
    }
  })

app
  .use('/files', express.static(path.join(__dirname, 'files')))
  .use('/branches', branchesRouter)
  .use('/customers', customersRouter)
  .use('/product-stocks', productStocksRouter)
  .use('/products', productsRouter)
  .use('/suppliers', suppliersRouter)
  .use('/transactions', transactionsRouter)
  .use('/user-roles', userRolesRouter)
  .use('/users', usersRouter)
  .use('/', mainRouter)

app.listen(port, async () => {
  try {
    await connectToDatabase()
    console.info(`server listening on http//localhost:${port}`)
  } catch (e) {
    console.error(`server crashed: ${e}`)
  }
})