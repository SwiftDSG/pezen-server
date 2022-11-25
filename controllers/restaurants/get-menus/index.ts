import { Request, Response } from "express";

import { getRestaurantDataMenusByCode } from "../../../connectors/restaurants/get-data-menus";
import { RestaurantMenusResponse } from "../../../interfaces/restaurant";
import { errorHandler } from "../../../plugins/errors";

export async function restaurantGetDataController(req: Request, res: Response): Promise<void> {
  try {
    const {
      params: {
        code
      },
      query: {
        type
      }
    }: {
      params: {
        code?: string
      },
      query: {
        type?: 'dine-in' | 'pre-order'
      }
    } = req

    const restaurant: RestaurantMenusResponse = await getRestaurantDataMenusByCode(code, type)

    res.status(200).send(restaurant)
  } catch (e) {
    errorHandler(e, res)
  }
}