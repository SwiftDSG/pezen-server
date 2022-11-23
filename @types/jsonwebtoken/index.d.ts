export { }

declare module 'jsonwebtoken' {
  export interface JwtUser extends jwt.JwtPayload {
    sub?: string
    _id?: string
    role_id: string[]
    branch_id: string[]
    name: string
  }
}
