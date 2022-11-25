import { Request, Response } from 'express'
import { InsertOneResult, ObjectId } from 'mongodb'

import { User } from '../../../interfaces/user'
import { errorHandler } from '../../../plugins/errors'
import { RestaurantBase, RestaurantBody } from '../../../interfaces/restaurant'
import { verifyAction } from '../../../plugins/authentication'
import { generateRandomString, verifyAddress } from '../../../plugins/helpers'
import { Address } from '../../../interfaces/general'
import { createRestaurant } from '../../../connectors/restaurants/create'
import { findUserById } from '../../../connectors/users/find-by-id'

export async function restaurantPostController(req: Request, res: Response): Promise<void> {
  try {
    const {
      body: {
        name,
        position,
        type,
        address,
        categories
      },
      user
    }: {
      body: RestaurantBody
      user?: Request['user']
    } = req
    if (verifyAction(user, 'restaurant-post')) throw new Error('UNAUTHORIZED')

    if (!name || typeof name !== 'string') throw new Error('RESTAURANT_MUST_HAVE_VALID_NAME')

    const { formatted_address }: Address = await verifyAddress({
      address,
      position,
    })

    const payload: RestaurantBase = {
      name,
      code: generateRandomString(5),
      type,
      address,
      categories,
      member: [
        {
          _id: user._id,
          role: 'owner'
        }
      ],
      position,
      formatted_address,
      status: 'inactive',
      create_date: new Date()
    }

    const { insertedId: newRestaurantId }: InsertOneResult = await createRestaurant(payload)

    const issuer: User = await findUserById(new ObjectId(user._id))
    if (issuer.restaurant_id?.length) issuer.restaurant_id = []
    issuer.restaurant_id.push(newRestaurantId)

    res.status(201).send(newRestaurantId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}