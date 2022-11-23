import { Router } from "express";

import { branchPostController } from "../controllers/branches/post";
import { branchGetSearchController } from "../controllers/branches/get";

const router: Router = Router()

router.post('/', branchPostController)
router.get('/', branchGetSearchController)

export default router