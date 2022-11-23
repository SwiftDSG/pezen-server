import { Router } from "express";

import { supplierPostController } from "../controllers/suppliers/post";
import { supplierGetNamesController } from "../controllers/suppliers/get-names";
import { supplierGetSearchController } from "../controllers/suppliers/get";

const router: Router = Router()

router.post('/', supplierPostController)
router.get('/names', supplierGetNamesController)
router.get('/', supplierGetSearchController)

export default router