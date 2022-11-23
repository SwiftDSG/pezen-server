import { Router } from "express";

import { userPostController } from "../controllers/users/post";
import { userPostLoginController } from "../controllers/users/post-login";
import { userPostRefreshTokenController } from "../controllers/users/post-refresh-token";
import { userPutImageController } from "../controllers/users/put-image";
import { userPutController } from "../controllers/users/put";
import { userGetOverviewController } from "../controllers/users/get-overview";
import { userGetSearchController } from "../controllers/users/get";

const router: Router = Router()

router.post('/', userPostController)
router.post('/login', userPostLoginController)
router.post('/refresh-token', userPostRefreshTokenController)
router.put('/image/:_id', userPutImageController)
router.put('/:_id', userPutController)
router.get('/overview', userGetOverviewController)
router.get('/', userGetSearchController)

export default router