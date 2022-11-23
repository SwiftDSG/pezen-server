import multer from 'multer'
import path from 'path'
import { access, mkdir } from 'fs/promises'
import { constants } from 'fs'
import { promisify } from 'util'
import { Request } from 'express'
import { ObjectId } from 'mongodb'

const usersImageStorage: multer.StorageEngine = multer.diskStorage({
  async destination(req: Request, file: Express.Multer.File, cb: (error: Error, destination: string) => void): Promise<void> {
    const dir: string = path.join(__dirname, '../files/users/', req.params._id)
    try {
      await access(dir, constants.F_OK)
      cb(null, dir)
    } catch (e) {
      await mkdir(dir, { recursive: true })
      cb(null, dir)
    }
  },
  async filename(req: Request, file: Express.Multer.File, cb: (error: Error, destination: string) => void): Promise<void> {
    const name: string = `${new ObjectId()}${path.extname(file.originalname)}`
    const dir: string = path.join(__dirname, '../files/users/', req.params._id, name)
    try {
      await access(dir, constants.F_OK)
      cb(null, name)
    } catch (e) {
      cb(null, name)
    }
  }
})
const productsImageStorage: multer.StorageEngine = multer.diskStorage({
  async destination(req: Request, file: Express.Multer.File, cb: (error: Error, destination: string) => void): Promise<void> {
    const dir: string = path.join(__dirname, '../files/products/', req.params._id)
    try {
      await access(dir, constants.F_OK)
      cb(null, dir)
    } catch (e) {
      await mkdir(dir, { recursive: true })
      cb(null, dir)
    }
  },
  async filename(req: Request, file: Express.Multer.File, cb: (error: Error, destination: string) => void): Promise<void> {
    const name: string = `${new ObjectId()}${path.extname(file.originalname)}`
    const dir: string = path.join(__dirname, '../files/products/', req.params._id, name)
    try {
      await access(dir, constants.F_OK)
      cb(null, name)
    } catch (e) {
      cb(null, name)
    }
  }
})
const transactionsFileStorage: multer.StorageEngine = multer.diskStorage({
  async destination(req: Request, file: Express.Multer.File, cb: (error: Error, destination: string) => void): Promise<void> {
    const dir: string = path.join(__dirname, '../files/transactions/', req.params._id)
    try {
      await access(dir, constants.F_OK)
      cb(null, dir)
    } catch (e) {
      await mkdir(dir, { recursive: true })
      cb(null, dir)
    }
  },
  async filename(req: Request, file: Express.Multer.File, cb: (error: Error, destination: string) => void): Promise<void> {
    const name: string = `${new ObjectId()}${path.extname(file.originalname)}`
    const dir: string = path.join(__dirname, '../files/transactions/', req.params._id, name)
    try {
      await access(dir, constants.F_OK)
      cb(null, name)
    } catch (e) {
      cb(null, name)
    }
  }
})

const usersImageHandler = promisify(multer({ storage: usersImageStorage }).array('image'))
const productsImageHandler = promisify(multer({ storage: productsImageStorage }).array('image'))
const transactionsFileHandler = promisify(multer({ storage: transactionsFileStorage }).array('file'))

export { usersImageHandler, productsImageHandler, transactionsFileHandler }