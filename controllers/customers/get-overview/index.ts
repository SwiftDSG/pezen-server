import { Request, Response } from "express";

import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'
import { CustomerResponse } from "../../../interfaces/customer";
import { getCustomersOverview } from "../../../connectors/customers/get-overview";

export async function customerGetOverviewController(req: Request, res: Response) {
  try {
    const {
      user
    }: {
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-customer')) throw new Error('UNAUTHORIZED')

    const customers: CustomerResponse[] = await getCustomersOverview()

    res.status(200).send(customers)
  } catch (e) {
    errorHandler(e, res)
  }
}