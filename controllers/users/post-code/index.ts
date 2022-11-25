import { Request, Response } from 'express'

import { errorHandler } from '../../../plugins/errors'
import { findUserByEmail } from '../../../connectors/users/find-by-email'
import { User } from '../../../interfaces/user'
import { addTask } from '../../../plugins/tasks'

export async function userPostCodeController(req: Request, res: Response) {
  try {
    const {
      body: {
        email
      }
    }: {
      body: {
        email: string
      }
    } = req
    const user: User = await findUserByEmail(email)
    if (user) throw new Error('USER_ALREADY_EXIST')

    const regex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!regex.test(email))
      throw new Error('INVALID_EMAIL')

    const availableChars: string = 'ABCDEFHJKLMNPQRSTUVWXYZ2345789'
    let str: string = ''
    for (let i = 0; i < 6; i++) {
      str += availableChars[Math.round(Math.random() * (availableChars.length - 1))]
    }

    const expDate: Date = new Date(new Date().valueOf() + 300000)

    // await sendEmail({
    //   to: email,
    //   subject: 'Kode verifikasi Pezen anda!',
    //   body: `<p>Kode verifikasi anda adalah <strong>${str}</strong>, kode ini akan berlaku selama 15 menit.</p>`
    // })

    await addTask('CANCEL_EMAIL_VERIFICATION', expDate, {
      email,
      code: str
    })

    res.status(200).send()
  } catch (e) {
    errorHandler(e, res)
  }
}