import { Router } from "express";

import { userRoleGetSearchController } from "../controllers/user-roles/get";
import { userRolePostController } from "../controllers/user-roles/post";

const router: Router = Router()

router.post('/', userRolePostController)
router.get('/', userRoleGetSearchController)

export default router