import { Request, Response } from 'express'

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../plugins/tokens'
import { errorHandler } from '../../../plugins/errors'
import { getUserDataById } from '../../../connectors/users/get-data-by-id'
import { UserResponse } from '../../../interfaces/user'

export async function userPostRefreshController(req: Request, res: Response) {
  try {
    const {
      body: { rtk }
    }: {
      body: {
        rtk: string
      }
    } = req
    const tokenPayload: Request['user'] = verifyRefreshToken(rtk)

    if (!tokenPayload) throw new Error('UNAUTHORIZED')

    const newAtk: string = generateAccessToken(tokenPayload)
    const newRtk: string = generateRefreshToken(tokenPayload)

    const userData: UserResponse = await getUserDataById(tokenPayload._id)

    res.status(200).send({ atk: newAtk, rtk: newRtk, user: userData })
  } catch (e) {
    errorHandler(e, res)
  }
}