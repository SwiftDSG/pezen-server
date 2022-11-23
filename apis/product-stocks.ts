import { Router } from "express";

import { stockPostController } from "../controllers/product-stocks/post";
import { stockPutController } from "../controllers/product-stocks/put";

const router: Router = Router()

router.post('/:product_id', stockPostController)
router.put('/:product_id', stockPutController)

export default router