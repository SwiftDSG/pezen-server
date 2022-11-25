import { Request, Response } from 'express'
import { pbkdf2Sync } from 'crypto'

import { generateAccessToken, generateRefreshToken } from '../../../plugins/tokens'
import { errorHandler } from '../../../plugins/errors'
import { findUserByEmail } from '../../../connectors/users/find-by-email'
import { getUserDataById } from '../../../connectors/users/get-data-by-id'
import { User, UserMinResponse, UserRole } from '../../../interfaces/user'

export async function userPostLoginController(req: Request, res: Response) {
  try {
    const {
      query: {
        type
      },
      body: {
        email,
        password
      }
    }: {
      query: {
        type?: UserRole
      }
      body: {
        email: string
        password: string
      }
    } = req

    const user: User = await findUserByEmail(email)
    if (!user) throw new Error('INVALID_COMBINATION')

    const triedPassword: string = pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex')
    if (triedPassword !== user.password) throw new Error('INVALID_COMBINATION')

    const payload: Request['user'] = {
      _id: user._id,
      role: user.role,
      name: user.name
    }
    const atk: string = generateAccessToken(payload)
    const rtk: string = generateRefreshToken(payload)

    const userData: UserMinResponse = await getUserDataById<UserMinResponse>(user._id)

    if (type === 'restaurant' && !userData.role.includes('admin')) throw new Error('UNAUTHORIZED')

    res.status(200).send({ atk, rtk, user: userData })
  } catch (e) {
    errorHandler(e, res)
  }
}