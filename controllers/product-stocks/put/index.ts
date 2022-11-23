import { Request, Response } from 'express'
import { InsertOneResult, ObjectId } from 'mongodb'

import { Product } from '../../../interfaces/product'
import { ProductStock } from '../../../interfaces/product-stock'
import { createProductActivity } from '../../../connectors/product-activities/create'
import { updateProductStock } from '../../../connectors/product-stocks/update'
import { findAvailableProductStocksByProductId } from '../../../connectors/product-stocks/find-available-by-product-id'
import { createDocument } from '../../../connectors/documents/create'
import { findProductById } from '../../../connectors/products/find-by-id'
import { errorHandler } from '../../../plugins/errors'
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'
import { generateDocumentNumber } from '../../../plugins/documents'

export async function stockPutController(req: Request, res: Response) {
  try {
    const {
      params: {
        product_id
      },
      body: {
        branch_id,
        quantity,
      },
      user
    }: {
      params: {
        product_id?: string
      },
      body: {
        branch_id: string
        quantity: number
      },
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'update-stock')) throw new Error('UNAUTHORIZED')

    const product: Product = await findProductById(new ObjectId(product_id))
    if (!product) throw new Error('PRODUCT_NOT_FOUND')

    const availableProductStock: ProductStock[] = await findAvailableProductStocksByProductId(new ObjectId(product_id), new ObjectId(branch_id))
    if (!availableProductStock?.length) throw new Error('STOCK_NOT_FOUND')

    const totalQuantity: number = availableProductStock.reduce((a, b) => a + b.quantity, 0)
    if (quantity > totalQuantity) throw new Error('STOCK_NOT_ENOUGH')

    const stockPayload: { _id: ObjectId, quantity: number }[] = []
    const affectedProductStock: ProductStock[] = []
    let remaining: number = quantity
    let index: number = 0
    while (remaining > 0) {
      const stock: ProductStock = availableProductStock[index]
      if (stock.remaining - remaining >= 0) {
        stockPayload[index] = {
          _id: stock._id,
          quantity: remaining
        }
        stock.remaining -= remaining
        remaining = 0
      } else {
        stockPayload[index] = {
          _id: stock._id,
          quantity: stock.remaining
        }
        remaining -= stock.remaining
        stock.remaining = 0
      }
      index++
      affectedProductStock.push(stock)
    }

    for (let i: number = 0; i < availableProductStock.length; i++) {
      await updateProductStock(affectedProductStock[i])
      await addEvent({
        type: 'action',
        action: 'update-stock',
        date: new Date(),
        before_data: availableProductStock[i],
        after_data: affectedProductStock[i],
        user,
      })
    }

    const { insertedId: newDocumentId }: InsertOneResult = await createDocument({
      type: 'delivery_document',
      number: await generateDocumentNumber('delivery_document', new ObjectId(branch_id)),
      create_date: new Date()
    })

    await createProductActivity({
      product_id: new ObjectId(product_id),
      branch_id: new ObjectId(branch_id),
      document_id: newDocumentId,
      type: 'reduction',
      date: new Date(),
      stock: stockPayload,
      user: {
        _id: user._id,
        name: user.name
      }
    })

    res.status(200).send(affectedProductStock.map((a) => a._id.toString()))
  } catch (e) {
    errorHandler(e, res)
  }
}