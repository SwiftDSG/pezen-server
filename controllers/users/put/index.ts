import { Request, Response } from 'express'
import { ObjectId, UpdateResult } from 'mongodb'

import { UserBody, User } from '../../../interfaces/user'
import { errorHandler } from '../../../plugins/errors'
import { verifyAction } from '../../../plugins/authentication'
import { findUserById } from '../../../connectors/users/find-by-id'
import { updateUser } from '../../../connectors/users/update'
import { usersImageHandler } from '../../../plugins/multipart'
import { deleteFile } from '../../../plugins/files'
import { verifyAddress } from '../../../plugins/helpers'
import { Address } from '../../../interfaces/general'

export async function userPutController(req: Request, res: Response) {
  try {
    await usersImageHandler(req, res)
    const {
      params: {
        _id
      },
      body: {
        name,
        password,
        birth_date,
        phone,
        address
      },
      user,
      file
    }: {
      params: {
        _id?: string
      },
      body: UserBody,
      user?: Request['user'],
      file?: Request['file']
    } = req
    if (!await verifyAction(user, 'user-put')) throw new Error('UNAUTHORIZED')

    const issuer: User = await findUserById(new ObjectId(_id))
    if (!issuer) throw new Error('USER_NOT_FOUND')

    if (name && typeof name === 'string') issuer.name === name
    if (phone && typeof phone === 'string') issuer.phone === phone
    if (password && (typeof password !== 'string' || password.length < 8)) issuer.password = password
    if (!isNaN(new Date(birth_date).getTime())) issuer.birth_date = new Date(birth_date)
    if (file) {
      if (issuer.image_url) await deleteFile(issuer.image_url)
      issuer.image_url = `/users/${_id}/${file.filename}`
    }
    if (address && address.length) {
      const addresses: Address[] = []
      for (let i: number = 0; i < address.length; i++) {
        const verifiedAddress: Address = await verifyAddress(address[i])
        addresses.push({
          ...verifiedAddress
        })
      }
      issuer.address = addresses
    } else if (address && !address.length) issuer.address = []

    const { modifiedCount }: UpdateResult = await updateUser(issuer)
    if (!modifiedCount) throw new Error('USER_NOT_UPDATED')

    res.status(200).send(issuer)
  } catch (e) {
    errorHandler(e, res)
  }
}