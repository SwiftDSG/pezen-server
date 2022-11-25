import { randomUUID } from 'crypto'
import { createServer, Server } from 'http'

import express, { Express, Request, Response, NextFunction, json, urlencoded } from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import cookie from 'cookie-parser'
import path from 'path'

import { connectToDatabase } from './plugins/connections'
import { verifyAccessToken } from './plugins/tokens'
import { initSocket } from './plugins/sockets'

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
      if (!req.cookies.uuid) {
        const id: string = randomUUID()
        res.cookie('uuid', id, {
          httpOnly: true,
          maxAge: 31536000000
        })
      } else {
        res.cookie('uuid', req.cookies.uuid, {
          httpOnly: true,
          maxAge: 31536000000
        })
      }
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

const server: Server = createServer(app)

server.listen(port, async () => {
  try {
    initSocket(server, allowedURL)

    await connectToDatabase()
    console.info(`server listening on http//localhost:${port}`)
  } catch (e) {
    console.error(`server crashed: ${e}`)
  }
})