import { Request, Response } from "express";

import { UserOverview } from "../../../interfaces/user";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'
import { getUsersOverview } from "../../../connectors/users/get-overview";

export async function userGetOverviewController(req: Request, res: Response) {
  try {
    const {
      query,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-user')) throw new Error('UNAUTHORIZED')
    const { range = 'monthly' }: {
      range: 'weekly' | 'monthly'
    } = query

    const currentDate: Date = new Date()
    let difference: number = 0

    if (range === 'weekly') difference = currentDate.getDay() - 1
    else if (range === 'monthly') difference = currentDate.getDate() - 1

    const startDate: Date = new Date(currentDate.setHours(0, 0, 0, 0) - (difference + 30 * 86400000))

    const overview: UserOverview[] = await getUsersOverview({
      start_date: startDate,
      end_date: currentDate
    })

    res.status(200).send(overview)
  } catch (e) {
    errorHandler(e, res)
  }
}