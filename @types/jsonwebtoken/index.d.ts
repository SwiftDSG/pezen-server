import { UserRole } from "../../interfaces/user"

export { }

declare module 'jsonwebtoken' {
  export interface JwtUser extends jwt.JwtPayload {
    sub?: string
    _id?: string
    role: UserRole[]
    name: string
  }
}
