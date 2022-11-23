import { Request, Response } from "express";

import { SupplierMin } from "../../../interfaces/supplier";
import { getSuppliersNames } from "../../../connectors/suppliers/get-names";
import { errorHandler } from "../../../plugins/errors";

export async function supplierGetNamesController(req: Request, res: Response) {
  try {
    const suppliers: SupplierMin[] = await getSuppliersNames()

    res.status(200).send(suppliers)
  } catch (e) {
    errorHandler(e, res)
  }
}