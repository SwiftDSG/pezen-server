import { Request, Response } from "express";
import { UpdateResult, ObjectId } from "mongodb";

import { User } from "../../../interfaces/user";
import { findUserById } from "../../../connectors/users/find-by-id";
import { updateUser } from "../../../connectors/users/update";
import { deleteFile } from "../../../plugins/files";
import { usersImageHandler } from "../../../plugins/multipart";
import { errorHandler } from "../../../plugins/errors";

export async function userPutImageController(req: Request, res: Response) {
  try {
    await usersImageHandler(req, res)
    const {
      params: { _id },
      files,
    }: {
      params: {
        _id?: string
      },
      body: {
        file_delete?: string
      },
      files?: Request['files']
    } = req
    const user: User = await findUserById(new ObjectId(_id))
    if (!user) throw new Error('USER_NOT_FOUND')

    if (user.image_url)
      await deleteFile(user.image_url)

    if (files?.length) {
      for (let i: number = 0; i < files.length; i++) {
        const file: Express.Multer.File = files[i]
        user.image_url = `/users/${_id}/${file.filename}`
      }
    }

    const { modifiedCount }: UpdateResult = await updateUser(user)

    if (!modifiedCount) throw new Error('USER_NOT_UPDATED')

    res.status(200).send()
  } catch (e) {
    errorHandler(e, res)
  }
}