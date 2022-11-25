import { Request, Response } from 'express'

import { errorHandler } from '../../../plugins/errors'
import { findTaskByQuery } from '../../../connectors/tasks/find-by-query'
import { Task } from '../../../interfaces/task'

export async function userPostVerifyController(req: Request, res: Response) {
  try {
    const {
      body: {
        email,
        code
      }
    }: {
      body: {
        email: string
        code: string
      }
    } = req

    const task: Task = await findTaskByQuery({
      metadata: {
        email
      }
    })

    if (!task) throw new Error('VERIFICATION_CODE_EXPIRED')

    if (task.metadata.code !== code) throw new Error('VERIFICATION_CODE_DID_NOT_MATCH')

    res.status(200).send()
  } catch (e) {
    errorHandler(e, res)
  }
}