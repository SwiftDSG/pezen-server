import path from 'path'
import { access, rm } from 'fs/promises'
import { constants } from 'fs'

export async function deleteFile(filename: string): Promise<boolean> {
  try {
    const dir = path.join(__dirname, '../files', filename)
    await access(dir, constants.F_OK)
    await rm(dir)
    return true
  } catch (e) {
    return false
  }
}