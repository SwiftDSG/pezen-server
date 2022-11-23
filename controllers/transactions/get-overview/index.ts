import { Request, Response } from "express";

import { TransactionOverview } from "../../../interfaces/transaction";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'
import { getTransactionsOverview } from "../../../connectors/transactions/get-overview";

export async function transactionGetOverviewController(req: Request, res: Response) {
  try {
    const {
      query,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-transaction')) throw new Error('UNAUTHORIZED')
    const { range = 'monthly' }: {
      range: 'weekly' | 'monthly'
    } = query

    const currentDate: Date = new Date()
    let difference: number = 0

    if (range === 'weekly') difference = currentDate.getDay() - 1
    else if (range === 'monthly') difference = currentDate.getDate() - 1

    const startDate: Date = new Date(currentDate.setHours(0, 0, 0, 0) - (difference * 86400000))

    const overview: TransactionOverview[] = await getTransactionsOverview({
      start_date: startDate,
      end_date: currentDate
    })

    if (overview[0]?.type !== 'income') overview.unshift({ type: 'income', value: 0 })
    if (overview[1]?.type !== 'outcome') overview.push({ type: 'outcome', value: 0 })

    overview.push({
      type: 'profit',
      value: Math.abs((overview[0]?.value || 0) - (overview[1]?.value || 0))
    })

    res.status(200).send(overview)
  } catch (e) {
    errorHandler(e, res)
  }
}