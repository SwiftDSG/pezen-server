import { Request, Response } from "express";
import { UpdateResult, ObjectId } from "mongodb";

import { Product, ProductBase } from "../../../interfaces/product";
import { updateProduct } from "../../../connectors/products/update";
import { findProductById } from "../../../connectors/products/find-by-id";
import { findProductBySku } from "../../../connectors/products/find-by-sku";
import { errorHandler } from "../../../plugins/errors";
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'

export async function productPutController(req: Request, res: Response) {
  try {
    const {
      params: {
        _id
      },
      body: {
        name,
        sku,
        category,
        price = 0,
      },
      user
    }: {
      params: {
        _id?: string
      },
      body: ProductBase,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'update-product')) throw new Error('UNAUTHORIZED')

    const oldProduct: Product = await findProductById(new ObjectId(_id))
    const product: Product = { ...oldProduct }
    if (!product) throw new Error('PRODUCT_NOT_FOUND')

    let skuChanged: boolean = product.sku !== sku

    if (name && typeof name === 'string') product.name = name
    if (sku && typeof sku === 'string') product.sku = sku
    if (category && typeof category === 'string') product.category = category
    if (typeof price === 'number' && price >= 0) product.price = price

    if (skuChanged) {
      const productWithSameSKU: Product = await findProductBySku(sku)
      if (productWithSameSKU) throw new Error('PRODUCT_MUST_HAVE_UNIQUE_SKU')
    }

    const { modifiedCount }: UpdateResult = await updateProduct(product)

    if (!modifiedCount) throw new Error('PRODUCT_NOT_UPDATED')

    await addEvent({
      type: 'action',
      action: 'update-product',
      date: new Date(),
      before_data: oldProduct,
      after_data: product,
      user,
    })

    res.status(200).send(product._id.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}