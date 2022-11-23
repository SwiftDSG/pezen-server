import { Request, Response } from "express";

import { Branch } from "../../../interfaces/branch";
import { findBranchesByQuery } from "../../../connectors/branches/find-by-query";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'

export async function branchGetSearchController(req: Request, res: Response) {
  try {
    const {
      query,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-branch')) throw new Error('UNAUTHORIZED')

    const branches: Branch[] = await findBranchesByQuery(query)

    res.status(200).send(branches)
  } catch (e) {
    errorHandler(e, res)
  }
}