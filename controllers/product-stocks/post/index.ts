import { Request, Response } from 'express'
import { InsertOneResult, ObjectId } from 'mongodb'

import { ProductStockBase, ProductStockBody } from '../../../interfaces/product-stock'
import { Product } from '../../../interfaces/product'
import { createProductActivity } from '../../../connectors/product-activities/create'
import { createProductStock } from '../../../connectors/product-stocks/create'
import { findProductById } from '../../../connectors/products/find-by-id'
import { errorHandler } from '../../../plugins/errors'
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'
import { Branch } from '../../../interfaces/branch'
import { findBranchById } from '../../../connectors/branches/find-by-id'

export async function stockPostController(req: Request, res: Response) {
  try {
    const {
      params: {
        product_id
      },
      body: {
        branch_id,
        price,
        quantity,
        create_date = new Date()
      },
      user
    }: {
      params: {
        product_id?: string
      },
      body: ProductStockBody,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'create-stock')) throw new Error('UNAUTHORIZED')

    if (!quantity || typeof quantity !== 'number') throw new Error('STOCK_MUST_HAVE_VALID_QUANTITY')
    if (price && typeof price !== 'number') throw new Error('STOCK_MUST_HAVE_VALID_PRICE')

    const product: Product = await findProductById(new ObjectId(product_id))
    if (!product) throw new Error('STOCK_MUST_HAVE_VALID_PRODUCT')

    const branch: Branch = await findBranchById(new ObjectId(branch_id))
    if (!branch) throw new Error('STOCK_MUST_HAVE_VALID_BRANCH')

    const payload: ProductStockBase = {
      product_id: new ObjectId(product_id),
      branch_id: new ObjectId(branch_id),
      remaining: quantity,
      price: price || 0,
      quantity,
      create_date
    }

    const { insertedId: newStockId }: InsertOneResult = await createProductStock(payload)

    await createProductActivity({
      product_id: new ObjectId(product_id),
      branch_id: new ObjectId(branch_id),
      type: 'replenishment',
      date: new Date(),
      stock: [
        {
          _id: newStockId,
          quantity
        }
      ],
      user: {
        _id: user._id,
        name: user.name
      }
    })
    await addEvent({
      type: 'action',
      action: 'create-stock',
      date: new Date(),
      after_data: {
        ...payload,
        _id: newStockId
      },
      user,
    })

    res.status(201).send(newStockId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}