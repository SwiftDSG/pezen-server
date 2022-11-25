import { ObjectId } from "mongodb"
import { UserRole } from "../../interfaces/user"

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: ObjectId,
        role: UserRole[],
        name: string,
      },
      files?: Express.Multer.File[]
      file?: Express.Multer.File
    }
  }
}

export { }