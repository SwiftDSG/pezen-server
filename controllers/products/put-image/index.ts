import { Request, Response } from "express";
import { UpdateResult, ObjectId } from "mongodb";

import { Product } from "../../../interfaces/product";
import { findProductById } from "../../../connectors/products/find-by-id";
import { updateProduct } from "../../../connectors/products/update";
import { deleteFile } from "../../../plugins/files";
import { productsImageHandler } from "../../../plugins/multipart";
import { errorHandler } from "../../../plugins/errors";

export async function productPutImageController(req: Request, res: Response) {
  try {
    await productsImageHandler(req, res)
    const {
      params: { _id },
      body: { file_delete },
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
    const product: Product = await findProductById(new ObjectId(_id))
    if (!product) throw new Error('PRODUCT_NOT_FOUND')

    if (!product.image_url) product.image_url = []

    if (files?.length) {
      for (let i: number = 0; i < files.length; i++) {
        const file: Express.Multer.File = files[i]
        product.image_url.push(`/products/${_id}/${file.filename}`)
      }
    }

    const fileToDelete: string[] = JSON.parse(file_delete)
    if (fileToDelete?.length && product.image_url.length) {
      for (let i: number = 0; i < fileToDelete.length; i++) {
        const url: string = fileToDelete[i]
        const index: number = product.image_url.findIndex((a) => a === url)
        if (index > -1) product.image_url.splice(index, 1)
        await deleteFile(url)
      }
    }

    const { modifiedCount }: UpdateResult = await updateProduct(product)

    if (!modifiedCount) throw new Error('PRODUCT_NOT_UPDATED')

    res.status(200).send()
  } catch (e) {
    errorHandler(e, res)
  }
}