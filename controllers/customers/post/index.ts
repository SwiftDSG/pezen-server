import { Request, Response } from 'express'
import { InsertOneResult } from 'mongodb'

import { CustomerBase } from '../../../interfaces/customer'
import { createCustomer } from '../../../connectors/customers/create'
import { errorHandler } from '../../../plugins/errors'
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'

export async function customerPostController(req: Request, res: Response) {
  try {
    const {
      body: {
        name,
        address,
        contact_person,
        email,
        phone,
        create_date = new Date()
      },
      user
    }: {
      body: CustomerBase,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'create-customer')) throw new Error('UNAUTHORIZED')

    if (!name || typeof name !== 'string') throw new Error('CUSTOMER_MUST_HAVE_VALID_NAME')
    if (!address || typeof address !== 'string') throw new Error('CUSTOMER_MUST_HAVE_VALID_ADDRESS')
    if (!contact_person?.length) throw new Error('CUSTOMER_MUST_HAVE_VALID_CONTACT_PERSON')

    const payload: CustomerBase = {
      name,
      address,
      contact_person,
      email,
      phone,
      create_date
    }

    const { insertedId: newCustomerId }: InsertOneResult = await createCustomer(payload)

    await addEvent({
      type: 'action',
      action: 'create-customer',
      date: new Date(),
      after_data: {
        ...payload,
        _id: newCustomerId
      },
      user,
    })

    res.status(201).send(newCustomerId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}