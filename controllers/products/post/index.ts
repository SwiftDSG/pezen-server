import { Request, Response } from "express";
import { InsertOneResult } from "mongodb";

import { Product, ProductBase } from "../../../interfaces/product";
import { createProduct } from "../../../connectors/products/create";
import { findProductBySku } from "../../../connectors/products/find-by-sku";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'

export async function productPostController(req: Request, res: Response) {
  try {
    const {
      body: {
        name,
        sku,
        category,
        price = 0,
      },
      user
    }: {
      body: ProductBase,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'create-product')) throw new Error('UNAUTHORIZED')

    if (!name || typeof name !== 'string') throw new Error('PRODUCT_MUST_HAVE_VALID_NAME')
    if (!sku || typeof sku !== 'string') throw new Error('PRODUCT_MUST_HAVE_VALID_SKU')
    if (!category || typeof category !== 'string') throw new Error('PRODUCT_MUST_HAVE_VALID_CATEGORY')

    const productWithSameSKU: Product = await findProductBySku(sku)
    if (productWithSameSKU) throw new Error('PRODUCT_MUST_HAVE_UNIQUE_SKU')

    const payload: ProductBase = {
      name,
      sku,
      category,
      price,
    }

    const { insertedId: newProductId }: InsertOneResult = await createProduct(payload)

    await addEvent({
      type: 'action',
      action: 'create-product',
      date: new Date(),
      after_data: {
        ...payload,
        _id: newProductId
      },
      user,
    })

    res.status(201).send(newProductId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}