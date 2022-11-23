import { InsertOneResult, ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Document, DocumentBase } from "../../../interfaces/document"

export async function createDocument(data: DocumentBase): Promise<InsertOneResult> {
  const payload: Document = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.documents.insertOne(payload)
  return result
}