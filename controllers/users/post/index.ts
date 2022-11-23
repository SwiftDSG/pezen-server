import { Request, Response } from 'express'
import { InsertOneResult, ObjectId } from 'mongodb'

import { UserBody, User, UserBase } from '../../../interfaces/user'
import { UserRole } from '../../../interfaces/user-role'
import { Branch } from '../../../interfaces/branch'
import { createUserRole } from '../../../connectors/user-roles/create'
import { createUser } from '../../../connectors/users/create'
import { findUsersByQuery } from '../../../connectors/users/find-by-query'
import { findUserByEmail } from '../../../connectors/users/find-by-email'
import { findUserRoleById } from '../../../connectors/user-roles/find-by-id'
import { findBranchById } from '../../../connectors/branches/find-by-id'
import { errorHandler } from '../../../plugins/errors'
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'

export async function userPostController(req: Request, res: Response) {
  try {
    const {
      body: {
        role_id,
        branch_id,
        name,
        email,
        password,
        phone,
        birth_date,
      },
      user
    }: {
      body: UserBody,
      user?: Request['user']
    } = req

    let createOwner: boolean = false
    if (!user) {
      const users: User[] = await findUsersByQuery({})
      if (users.length) throw new Error('UNAUTHORIZED')
      createOwner = true
    } else if (!await verifyAction(user, 'create-user')) throw new Error('UNAUTHORIZED')

    if (!name || typeof name !== 'string') throw new Error('USER_MUST_HAVE_VALID_NAME')
    if (!email || typeof email !== 'string') throw new Error('USER_MUST_HAVE_VALID_EMAIL')
    if (!password || typeof password !== 'string' || password.length < 8) throw new Error('USER_MUST_HAVE_VALID_PASSWORD')
    if (isNaN(new Date(birth_date).getTime())) throw new Error('USER_MUST_HAVE_VALID_BIRTH_DATE')

    const roleIds: ObjectId[] = []
    const branchIds: ObjectId[] = []
    if (createOwner) {
      const { insertedId: ownerRoleId }: InsertOneResult = await createUserRole({
        name: 'owner',
        color: '#000000',
        action: ['all'],
        owner: true
      })

      roleIds.push(ownerRoleId)
    } else {
      if (!role_id?.length) throw new Error('USER_MUST_HAVE_VALID_ROLE')
      if (!branch_id?.length) throw new Error('USER_MUST_HAVE_VALID_BRANCH')

      const userWithSameEmail: User = await findUserByEmail(email)
      if (userWithSameEmail) throw new Error('USER_MUST_HAVE_UNIQUE_EMAIL')

      for (const id of role_id) {
        const role: UserRole = await findUserRoleById(new ObjectId(id))
        if (!role) throw new Error('USER_MUST_HAVE_VALID_ROLE')
        roleIds.push(new ObjectId(id))
      }

      for (const id of branch_id) {
        const branch: Branch = await findBranchById(new ObjectId(id))
        if (!branch) throw new Error('USER_MUST_HAVE_VALID_BRANCH')
        branchIds.push(new ObjectId(id))
      }
    }

    const payload: UserBase = {
      name,
      email,
      password,
      phone,
      birth_date: new Date(birth_date),
      create_date: new Date(),
      status: 'active'
    }

    const { insertedId: newUserId }: InsertOneResult = await createUser(payload, roleIds, branchIds)

    if (!createOwner) {
      await addEvent({
        type: 'action',
        action: 'create-user',
        date: new Date(),
        after_data: {
          ...payload,
          _id: newUserId
        },
        user,
      })
    }

    res.status(201).send(newUserId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}