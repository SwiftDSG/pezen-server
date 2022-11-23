import { collections } from "../../../plugins/connections"
import { Product } from "../../../interfaces/product"

export async function findProductBySku(sku: string): Promise<Product> {
  const result: Product = await collections.products.findOne({ sku }) as Product
  return result
}