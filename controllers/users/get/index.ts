import { Request, Response } from "express";

import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'
import { findUsersByQuery } from "../../../connectors/users/find-by-query";
import { User } from "../../../interfaces/user";

export async function userGetSearchController(req: Request, res: Response) {
  try {
    const {
      query: rawQuery,
      user
    }: {
      query: any,
      user?: Request['user']
    } = req

    if (!await verifyAction(user, 'read-user')) throw new Error('UNAUTHORIZED')
    const { text, limit, skip }: {
      text?: string
      limit?: number
      skip?: number
    } = rawQuery

    const query: {
      text?: string
      limit?: number
      skip?: number
    } = {
      text,
      limit,
      skip,
    }

    const users: User[] = await findUsersByQuery(query)

    res.status(200).send(users)
  } catch (e) {
    errorHandler(e, res)
  }
}