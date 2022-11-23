import { ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { Document } from "../../../interfaces/document";

export async function findDocumentById(_id: ObjectId): Promise<Document> {
  const result: Document = await collections.documents.findOne({ _id }) as Document
  return result
}