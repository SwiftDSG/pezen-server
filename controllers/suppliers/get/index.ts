import { Request, Response } from "express";

import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'
import { findSuppliersByQuery } from "../../../connectors/suppliers/find-by-query";
import { SupplierResponse } from "../../../interfaces/supplier";

export async function supplierGetSearchController(req: Request, res: Response) {
  try {
    const {
      query: rawQuery,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-supplier')) throw new Error('UNAUTHORIZED')
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

    const suppliers: SupplierResponse[] = await findSuppliersByQuery(query)

    res.status(200).send(suppliers)
  } catch (e) {
    errorHandler(e, res)
  }
}