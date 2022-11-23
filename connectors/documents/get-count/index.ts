import { Document } from "../../../interfaces/document"

import { collections } from "../../../plugins/connections"

export async function getDocumentsCount(type: Document['type']): Promise<number> {
  const date: Date = new Date()
  const month: number = date.getMonth()
  const year: number = date.getFullYear()
  const startOfMonth: Date = new Date(`${year}-${(month + 1).toString().padStart(2, '0')}-01`)
  const endOfMonth: Date = new Date(new Date(`${year}-${month >= 11 ? '01' : (month + 2).toString().padStart(2, '0')}-01`).getTime() - 86400000)

  const result: number = await collections.documents.countDocuments({
    type,
    create_date: {
      $gt: startOfMonth,
      $lte: endOfMonth
    }
  })

  return result
}