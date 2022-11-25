import { Request, Response } from "express";

import { getRestaurantDataByCode } from "../../../connectors/restaurants/get-data-by-code";
import { RestaurantDetailResponse } from "../../../interfaces/restaurant";
import { errorHandler } from "../../../plugins/errors";

export async function restaurantGetDataController(req: Request, res: Response): Promise<void> {
  try {
    const {
      params: {
        code
      },
      query: {
        lat,
        lng,
        courier
      }
    }: {
      params: {
        code?: string
      },
      query: {
        lat?: string
        lng?: string
        courier?: string
      }
    } = req

    const restaurant: RestaurantDetailResponse = await getRestaurantDataByCode(code, lat && lng ? {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    } : null, !!courier)

    res.status(200).send(restaurant)
  } catch (e) {
    errorHandler(e, res)
  }
}