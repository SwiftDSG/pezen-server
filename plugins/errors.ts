import { Response } from "express";
import { addEvent } from "./events";

export type ErrorMessage =
  'UNAUTHORIZED' |
  'INVALID_COMBINATION' |
  'USER_MUST_HAVE_VALID_NAME' |
  'USER_MUST_HAVE_VALID_EMAIL' |
  'USER_MUST_HAVE_VALID_BIRTH_DATE' |
  'USER_MUST_HAVE_VALID_PASSWORD' |
  'USER_MUST_HAVE_UNIQUE_EMAIL'

export function errorHandler(e: any, res: Response): void {
  const message: ErrorMessage = e.message
  let code: number = 500

  switch (message) {
    case
      'INVALID_COMBINATION' ||
      'USER_MUST_HAVE_VALID_NAME' ||
      'USER_MUST_HAVE_VALID_EMAIL' ||
      'USER_MUST_HAVE_VALID_BIRTH_DATE' ||
      'USER_MUST_HAVE_VALID_PASSWORD' ||
      'USER_MUST_HAVE_UNIQUE_EMAIL':
      code = 400
      break
    case 'UNAUTHORIZED':
      code = 401
      break
  }
  addEvent({
    type: 'error',
    date: new Date(),
    error_message: message,
    error_stack: e.stack
  })

  res.status(code).send(message)
}