import { Request, Response } from "express";

import { CustomerMin } from "../../../interfaces/customer";
import { getCustomersNames } from "../../../connectors/customers/get-names";
import { errorHandler } from "../../../plugins/errors";

export async function customerGetNamesController(req: Request, res: Response) {
  try {
    const customers: CustomerMin[] = await getCustomersNames()

    res.status(200).send(customers)
  } catch (e) {
    errorHandler(e, res)
  }
}