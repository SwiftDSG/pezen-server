import { ObjectId } from "mongodb"
import { Request } from "express"
import { readFileSync } from 'fs'
import { JwtUser, sign, verify } from 'jsonwebtoken'

const privateAccessKey: string = readFileSync('./keys/privateAccess.key', 'utf-8')
const privateRefreshKey: string = readFileSync('./keys/privateRefresh.key', 'utf-8')
const publicAccessKey: string = readFileSync('./keys/publicAccess.pem', 'utf-8')
const publicRefreshKey: string = readFileSync('./keys/publicRefresh.pem', 'utf-8')

export function generateAccessToken(payload: Request['user']): string {
  const subject: string = payload._id.toString()
  return sign({
    role: payload.role,
    name: payload.name
  }, privateAccessKey, {
    algorithm: 'RS256',
    expiresIn: '30m',
    issuer: 'SwiftDesign',
    audience: process.env.BASE_URL || 'http://localhost:8000',
    subject
  })
}

export function generateRefreshToken(payload: Request['user']): string {
  return sign(payload, privateRefreshKey, {
    algorithm: 'RS256',
    expiresIn: '1d',
    issuer: 'SwiftDesign',
    audience: process.env.BASE_URL || 'http://localhost:8000'
  })
}

export function verifyAccessToken(token: string): Request['user'] {
  try {
    const result: JwtUser = <JwtUser>verify(token, publicAccessKey, {
      algorithms: ['RS256'],
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    const payload: Request['user'] = {
      role: result.role,
      name: result.name,
      _id: new ObjectId(result.sub)
    }
    return payload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): Request['user'] {
  try {
    const result: JwtUser = <JwtUser>verify(token, publicRefreshKey, {
      algorithms: ['RS256'],
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    const payload: Request['user'] = {
      role: result.role,
      name: result.name,
      _id: new ObjectId(result._id)
    }
    return payload
  } catch {
    return null
  }
}