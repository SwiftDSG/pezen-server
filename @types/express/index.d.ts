import { ObjectId } from "mongodb"

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: ObjectId,
        role_id: ObjectId[],
        branch_id: ObjectId[]
        name: string,
      },
      files?: Express.Multer.File[]
    }
  }
}

export { }