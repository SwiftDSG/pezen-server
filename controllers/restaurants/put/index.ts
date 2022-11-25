import { Request, Response } from 'express'
import { ObjectId, UpdateResult } from 'mongodb'

import { errorHandler } from '../../../plugins/errors'
import { Restaurant, RestaurantBody } from '../../../interfaces/restaurant'
import { verifyAction } from '../../../plugins/authentication'
import { verifyAddress } from '../../../plugins/helpers'
import { Address } from '../../../interfaces/general'
import { findRestaurantById } from '../../../connectors/restaurants/find-by-id'
import { updateRestaurant } from '../../../connectors/restaurants/update'
import { findUserById } from '../../../connectors/users/find-by-id'
import { User } from '../../../interfaces/user'

export async function restaurantPutController(req: Request, res: Response): Promise<void> {
  try {
    const {
      params: {
        _id
      },
      body: {
        name,
        position,
        type,
        address,
        categories,
        opening_hour,
        status,
        member
      },
      user
    }: {
      body: RestaurantBody
      params: {
        _id?: string
      }
      user?: Request['user']
    } = req
    if (verifyAction(user, 'restaurant-put')) throw new Error('UNAUTHORIZED')

    const restaurant: Restaurant = await findRestaurantById(new ObjectId(_id))
    if (!restaurant) throw new Error('RESTAURANT_NOT_FOUND')

    if (name && typeof name === 'string') restaurant.name = name
    if (position && address) {
      const { formatted_address }: Address = await verifyAddress({
        address,
        position,
      })

      restaurant.position = position
      restaurant.address = address
      restaurant.formatted_address = formatted_address
    }
    if (opening_hour?.length === 7) {
      restaurant.opening_hour = opening_hour
    }
    if (['active', 'inactive'].includes(status)) restaurant.status = status
    if (['dine-in', 'take-awar'].includes(type)) restaurant.type = type
    if (categories?.length && categories.every((a) => typeof a === 'number')) restaurant.categories = categories
    if (member?.length > 1) {
      restaurant.member = [member[0]]
      for (let i: number = 1; i < member.length; i++) {
        const issuer: User = await findUserById(new ObjectId(member[i]._id))
        if (!issuer) throw new Error('USER_NOT_FOUND')
        restaurant.member.push({
          _id: issuer._id,
          role: member[i].role
        })
      }
    }

    const { modifiedCount }: UpdateResult = await updateRestaurant(restaurant)
    if (!modifiedCount) throw new Error('RESTAURANT_NOT_UPDATED')

    res.status(200).send(restaurant)
  } catch (e) {
    errorHandler(e, res)
  }
}