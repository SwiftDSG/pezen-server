import { Request, Response } from "express";

import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'
import { findCustomersByQuery } from "../../../connectors/customers/find-by-query";
import { CustomerResponse } from "../../../interfaces/customer";

export async function customerGetSearchController(req: Request, res: Response) {
  try {
    const {
      query: rawQuery,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-customer')) throw new Error('UNAUTHORIZED')
    const { limit, skip }: {
      limit?: number
      skip?: number
    } = rawQuery

    const query: {
      limit?: number
      skip?: number
    } = {
      limit,
      skip,
    }

    const customers: CustomerResponse[] = await findCustomersByQuery(query)

    res.status(200).send(customers)
  } catch (e) {
    errorHandler(e, res)
  }
}