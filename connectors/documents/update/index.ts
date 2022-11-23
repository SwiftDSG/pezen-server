import { UpdateResult } from "mongodb"

import { collections } from "../../../plugins/connections"
import { Document } from "../../../interfaces/document"

export async function updateDocument(data: Document): Promise<UpdateResult> {
  const result: UpdateResult = await collections.documents.updateOne({ _id: data._id }, { $set: { ...data } })
  return result
}