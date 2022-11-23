import { Request, Response } from "express";
import { InsertOneResult, ObjectId } from "mongodb";

import { Transaction } from "../../../interfaces/transaction";
import { findTransactionById } from "../../../connectors/transactions/find-by-id";
import { transactionsFileHandler } from "../../../plugins/multipart";
import { errorHandler } from "../../../plugins/errors";
import { Document } from "../../../interfaces/document";
import { findDocumentById } from "../../../connectors/documents/find-by-id";
import { updateDocument } from "../../../connectors/documents/update";
import { createDocument } from "../../../connectors/documents/create";
import { updateTransaction } from "../../../connectors/transactions/update";

export async function transactionPutFileController(req: Request, res: Response) {
  try {
    await transactionsFileHandler(req, res)
    const {
      params: { _id },
      body: {
        document_id,
        number
      },
      files,
    }: {
      params: {
        _id?: string
      },
      body: {
        document_id?: string
        number?: string
      },
      files?: Request['files']
    } = req
    const transaction: Transaction = await findTransactionById(new ObjectId(_id))
    if (!transaction) throw new Error('TRANSACTION_NOT_FOUND')

    if (files?.length) {
      for (let i: number = 0; i < files.length; i++) {
        const file: Express.Multer.File = files[i]
        if (file.originalname.includes('purchase_order')) {
          const document: Document = await findDocumentById(transaction.document_id)
          if (!document) throw new Error('DOCUMENT_NOT_FOUND')

          document.file_url = `/transactions/${_id}/${file.filename}`
          await updateDocument(document)
        } else if (file.originalname.includes('tax_invoice')) {
          if (!document_id || !number) throw new Error('INVALID_REQUEST')

          const index: number = transaction.payment?.findIndex((a) => a.document_id.findIndex((b) => b.toString() === document_id) > -1)
          if (index === -1) throw new Error('PAYMENT_NOT_FOUND')

          const document: Document = await findDocumentById(new ObjectId(document_id))
          if (!document) throw new Error('DOCUMENT_NOT_FOUND')

          const { insertedId: documentId }: InsertOneResult = await createDocument({
            number,
            type: 'tax_invoice',
            create_date: new Date(),
            reference: [
              {
                _id: document._id,
                type: 'invoice',
                number: document.number
              }
            ],
            file_url: `/transactions/${_id}/${file.filename}`
          })

          transaction.payment[index].document_id.push(documentId)
          await updateTransaction(transaction)
        } else if (file.originalname.includes('invoice')) {
          if (!document_id) throw new Error('INVALID_REQUEST')

          const document: Document = await findDocumentById(new ObjectId(document_id))
          if (!document) throw new Error('DOCUMENT_NOT_FOUND')

          document.file_url = `/transactions/${_id}/${file.filename}`
          await updateDocument(document)
        }
      }
    }

    res.status(200).send()
  } catch (e) {
    errorHandler(e, res)
  }
}