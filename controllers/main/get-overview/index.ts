import { Request, Response } from "express";

import { TransactionOverview } from "../../../interfaces/transaction";
import { errorHandler } from "../../../plugins/errors";
import { getTransactionsOverview } from "../../../connectors/transactions/get-overview";
import { BranchOverviewResponse } from "../../../interfaces/branch";
import { getBranchesOverview } from "../../../connectors/branches/get-overview";
import { getProductsOverview } from "../../../connectors/products/get-overview";
import { ProductOverviewResponse } from "../../../interfaces/product";

export async function mainGetOverviewController(req: Request, res: Response) {
  try {
    const cashflow: {
      label: Date,
      value: [number, number]
    }[] = []
    let processingCount: number = 0
    let saleCount: number = 0
    let averageSales: number = 0
    let totalSales: number = 0

    for (let i: number = 0; i < 7; i++) {
      const startDate: Date = new Date(new Date().setHours(0, 0, 0, 0) - i * 86400000)
      const endDate: Date = new Date(new Date().setHours(23, 59, 59, 999) - i * 86400000)
      const overview: TransactionOverview[] = await getTransactionsOverview({
        start_date: startDate,
        end_date: endDate
      })

      if (overview[0]?.type !== 'income') overview.unshift({ type: 'income', value: 0 })
      if (overview[1]?.type !== 'outcome') overview.push({ type: 'outcome', value: 0 })

      processingCount += overview[0].processing || 0
      saleCount += overview[0].count || 0
      totalSales += overview[0].value

      overview.push({
        type: 'profit',
        value: Math.abs((overview[0]?.value || 0) - (overview[1]?.value || 0)),
      })
      cashflow.unshift({
        label: startDate,
        value: [overview[0].value, overview[1].value]
      })
    }

    averageSales = (totalSales / saleCount) || 0

    const currentDate: Date = new Date()
    const startDate: Date = new Date(currentDate.setHours(0, 0, 0, 0) - ((currentDate.getDate() - 1) * 86400000))

    const branches: BranchOverviewResponse[] = await getBranchesOverview({
      start_date: startDate,
      end_date: currentDate
    })
    const products: ProductOverviewResponse[] = await getProductsOverview()

    res.status(200).send({ products, branches, cashflow, processingCount, saleCount, averageSales, totalSales })
  } catch (e) {
    errorHandler(e, res)
  }
}