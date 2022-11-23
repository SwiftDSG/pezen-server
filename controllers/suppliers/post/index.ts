import { Request, Response } from 'express'
import { InsertOneResult } from 'mongodb'

import { SupplierBase } from '../../../interfaces/supplier'
import { createSupplier } from '../../../connectors/suppliers/create'
import { errorHandler } from '../../../plugins/errors'
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'

export async function supplierPostController(req: Request, res: Response) {
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
      body: SupplierBase,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'create-supplier')) throw new Error('UNAUTHORIZED')

    if (!name || typeof name !== 'string') throw new Error('SUPPLIER_MUST_HAVE_VALID_NAME')
    if (!address || typeof address !== 'string') throw new Error('SUPPLIER_MUST_HAVE_VALID_ADDRESS')
    if (!contact_person?.length) throw new Error('SUPPLIER_MUST_HAVE_VALID_CONTACT_PERSON')

    const payload: SupplierBase = {
      create_date,
      name,
      address,
      email,
      phone,
      contact_person
    }

    const { insertedId: newSupplierId }: InsertOneResult = await createSupplier(payload)

    await addEvent({
      type: 'action',
      action: 'create-supplier',
      date: new Date(),
      after_data: {
        ...payload,
        _id: newSupplierId
      },
      user,
    })

    res.status(201).send(newSupplierId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}