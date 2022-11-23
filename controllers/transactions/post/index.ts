import { Request, Response } from 'express'
import { InsertOneResult, ObjectId } from 'mongodb'

import { TransactionBase, TransactionBody, TransactionItem } from '../../../interfaces/transaction'
import { Product } from '../../../interfaces/product'
import { Customer } from '../../../interfaces/customer'
import { Supplier } from '../../../interfaces/supplier'
import { DocumentBase } from '../../../interfaces/document'
import { createDocument } from '../../../connectors/documents/create'
import { createTransaction } from '../../../connectors/transactions/create'
import { findProductById } from '../../../connectors/products/find-by-id'
import { findCustomerById } from '../../../connectors/customers/find-by-id'
import { findSupplierById } from '../../../connectors/suppliers/find-by-id'
import { verifyAction } from '../../../plugins/authentication'
import { addEvent } from '../../../plugins/events'
import { errorHandler } from '../../../plugins/errors'
import { Branch } from '../../../interfaces/branch'
import { findBranchById } from '../../../connectors/branches/find-by-id'
import { generateDocumentNumber } from '../../../plugins/documents'

export async function transactionPostController(req: Request, res: Response) {
  try {
    const {
      body: {
        type,
        branch_id,
        subject_id,
        item,
        purchase_order,
        tax
      },
      user
    }: {
      body: TransactionBody,
      user?: Request['user']
    } = req
    if (!await verifyAction(user, 'create-transaction')) throw new Error('UNAUTHORIZED')

    let transactionApproved: boolean = false
    if (await verifyAction(user, 'approve-transaction')) transactionApproved = true

    if (type === 'sale') {
      const customer: Customer = await findCustomerById(new ObjectId(subject_id))
      if (!customer) throw new Error('TRANSACTION_MUST_HAVE_VALID_CUSTOMER')
      if (!purchase_order || typeof purchase_order !== 'string') throw new Error('TRANSACTION_MUST_HAVE_VALID_PURCHASE_ORDER_NUMBER')

    } else if (type === 'purchase') {
      const supplier: Supplier = await findSupplierById(new ObjectId(subject_id))
      if (!supplier) throw new Error('TRANSACTION_MUST_HAVE_VALID_SUPPLIER')
    }

    let sub_total: number = 0
    for (let i: number = 0; i < item.length; i++) {
      const product: Product = await findProductById(new ObjectId(item[i]._id))
      if (!product) throw new Error('TRANSACTION_MUST_HAVE_VALID_PRODUCT')
      if (type === 'sale') {
        if (item[i].price !== product.price) throw new Error('TRANSACTION_MUST_HAVE_VALID_PRODUCT_PRICE')
        if (typeof item[i].discount !== 'number' || item[i].discount < 0 || item[i].discount > 1) throw new Error('TRANSACTION_MUST_HAVE_VALID_PRODUCT_DISCOUNT')
        sub_total += (1 - item[i].discount) * item[i].price * item[i].quantity
      } else {
        sub_total += item[i].price * item[i].quantity
      }
    }

    if (typeof tax !== 'number' || tax < 0 || tax > 1) throw new Error('TRANSACTION_MUST_HAVE_VALID_TAX')

    const branch: Branch = await findBranchById(new ObjectId(branch_id))
    if (!branch) throw new Error('TRANSACTION_MUST_HAVE_VALID_BRANCH')

    const documentPayload: DocumentBase = {
      type: 'purchase_order',
      number: purchase_order,
      create_date: new Date()
    }

    if (type === 'purchase') {
      documentPayload.number = await generateDocumentNumber('purchase_order', new ObjectId(branch_id))
    }

    const { insertedId: newDocumentId }: InsertOneResult = await createDocument(documentPayload)

    const total: number = sub_total * (1 + tax)

    const payload: TransactionBase = {
      type,
      sub_total,
      total,
      tax,
      subject_id: new ObjectId(subject_id),
      branch_id: new ObjectId(branch_id),
      document_id: newDocumentId,
      item: item.map((a): TransactionItem => ({
        ...a,
        _id: new ObjectId(a._id)
      })),
      status: [
        {
          type: transactionApproved ? 'processing' : 'waiting',
          date: new Date(),
          user
        }
      ],
      create_date: new Date()
    }

    const { insertedId: newTransactionId }: InsertOneResult = await createTransaction(payload)

    await addEvent({
      type: 'action',
      action: 'create-transaction',
      date: new Date(),
      after_data: {
        ...payload,
        _id: newTransactionId
      },
      user,
    })

    res.status(201).send(newTransactionId.toString())
  } catch (e) {
    errorHandler(e, res)
  }
}