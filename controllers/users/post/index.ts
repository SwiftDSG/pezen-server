import { Request, Response } from 'express'
import { InsertOneResult } from 'mongodb'

import { UserBody, UserBase } from '../../../interfaces/user'
import { createUser } from '../../../connectors/users/create'
import { findUserByEmail } from '../../../connectors/users/find-by-email'
import { errorHandler } from '../../../plugins/errors'

export async function userPostController(req: Request, res: Response): Promise<void> {
  try {
    const {
      body: {
        name,
        email,
        password,
      },
    }: {
      body: UserBody,
    } = req

    if (!name || typeof name !== 'string') throw new Error('USER_MUST_HAVE_VALID_NAME')
    if (!email || typeof email !== 'string') throw new Error('USER_MUST_HAVE_VALID_EMAIL')
    if (!password || typeof password !== 'string' || password.length < 8) throw new Error('USER_MUST_HAVE_VALID_PASSWORD')

    if (await findUserByEmail(email)) throw new Error('USER_ALREADY_EXIST')


    const payload: UserBase = {
      name,
      email,
      password,
      role: ['user'],
      create_date: new Date(),
    }


    const { insertedId: newUserId }: InsertOneResult = await createUser(payload)

    res.status(201).send(newUserId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}