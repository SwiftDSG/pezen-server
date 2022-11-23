import { Request, Response } from 'express'
import { InsertOneResult } from 'mongodb'

import { UserRoleBase } from '../../../interfaces/user-role'
import { createUserRole } from '../../../connectors/user-roles/create'
import { errorHandler } from '../../../plugins/errors'
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'

export async function userRolePostController(req: Request, res: Response) {
  try {
    const {
      body: {
        name,
        color,
        action
      },
      user
    }: {
      body: UserRoleBase,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'create-role')) throw new Error('UNAUTHORIZED')

    if (!name || typeof name !== 'string') throw new Error('ROLE_MUST_HAVE_VALID_NAME')
    if (!color || typeof color !== 'string') throw new Error('ROLE_MUST_HAVE_VALID_COLOR')
    if (!action?.length) throw new Error('ROLE_MUST_HAVE_VALID_ACTION')

    const payload: UserRoleBase = {
      name,
      color,
      action,
      owner: false
    }

    const { insertedId: newUserRoleId }: InsertOneResult = await createUserRole(payload)

    await addEvent({
      type: 'action',
      action: 'create-role',
      date: new Date(),
      after_data: {
        ...payload,
        _id: newUserRoleId
      },
      user,
    })

    res.status(201).send(newUserRoleId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}