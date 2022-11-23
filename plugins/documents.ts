import { ObjectId } from "mongodb";

import { Branch } from "../interfaces/branch";
import { Document } from "../interfaces/document";
import { findBranchById } from "../connectors/branches/find-by-id";
import { getDocumentsCount } from "../connectors/documents/get-count";

const months: string[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export async function generateDocumentNumber(type: Document['type'], branch_id: ObjectId): Promise<string> {
  const branch: Branch = await findBranchById(branch_id)
  if (!branch) throw new Error('BRANCH_NOT_FOUND')

  const date: Date = new Date()
  const count: number = await getDocumentsCount(type)

  let str: string = ''
  if (type === 'delivery_document') {
    str += 'DO'
  } else if (type === 'invoice') {
    str += 'INV'
  } else if (type === 'purchase_order') {
    str += 'PO'
  } else if (type === 'acceptance_document') {
    str += 'ACC'
  } else if (type === 'warning_document') {
    str += 'SP'
  }
  str += `/${branch.code}/${date.getFullYear()}/${months[date.getMonth()]}/${(count + 1).toString().padStart(5, '0')}`
  return str
}