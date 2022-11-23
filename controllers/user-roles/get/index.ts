import { Request, Response } from "express";

import { UserRoleResponse } from "../../../interfaces/user-role";
import { findUserRolesByQuery } from "../../../connectors/user-roles/find-by-query";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'

export async function userRoleGetSearchController(req: Request, res: Response) {
  try {
    const {
      query: rawQuery,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-role')) throw new Error('UNAUTHORIZED')
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

    const roles: UserRoleResponse[] = await findUserRolesByQuery(query)

    res.status(200).send(roles)
  } catch (e) {
    errorHandler(e, res)
  }
}