import { Router } from "express";

import { customerPostController } from "../controllers/customers/post";
import { customerGetNamesController } from "../controllers/customers/get-names";
import { customerGetOverviewController } from "../controllers/customers/get-overview";
import { customerGetSearchController } from "../controllers/customers/get";

const router: Router = Router()

router.post('/', customerPostController)
router.get('/names', customerGetNamesController)
router.get('/overview', customerGetOverviewController)
router.get('/', customerGetSearchController)

export default router