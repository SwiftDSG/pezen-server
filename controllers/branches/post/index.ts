import { Request, Response } from 'express'
import { InsertOneResult } from 'mongodb'

import { User } from '../../../interfaces/user'
import { BranchBase } from '../../../interfaces/branch'
import { errorHandler } from '../../../plugins/errors'
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'
import { createBranch } from '../../../connectors/branches/create'
import { findUserById } from '../../../connectors/users/find-by-id'
import { updateUser } from '../../../connectors/users/update'

export async function branchPostController(req: Request, res: Response) {
  try {
    const {
      body: {
        name,
        code,
        address
      },
      user
    }: {
      body: BranchBase,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'create-branch')) throw new Error('UNAUTHORIZED')

    if (!name || typeof name !== 'string') throw new Error('BRANCH_MUST_HAVE_VALID_NAME')
    if (!code || typeof code !== 'string' || code.length !== 3) throw new Error('BRANCH_MUST_HAVE_VALID_CODE')
    if (!address || typeof address !== 'string') throw new Error('BRANCH_MUST_HAVE_VALID_ADDRESS')

    const payload: BranchBase = {
      code: code.toUpperCase(),
      name,
      address,
    }

    const { insertedId: newBranchId }: InsertOneResult = await createBranch(payload)

    const issuer: User = await findUserById(user._id)
    if (!issuer.branch_id) issuer.branch_id = []
    issuer.branch_id.push(newBranchId)

    await updateUser(issuer)
    await addEvent({
      type: 'action',
      action: 'create-branch',
      date: new Date(),
      after_data: {
        ...payload,
        _id: newBranchId
      },
      user,
    })

    res.status(201).send(newBranchId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}