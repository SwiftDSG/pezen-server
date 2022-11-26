import { Router } from "express";

import { userPostController } from "../../controllers/users/post";
import { userPostCodeController } from "../../controllers/users/post-code";
import { userPostLoginController } from "../../controllers/users/post-login";
import { userPostRefreshController } from "../../controllers/users/post-refresh";
import { userPostVerifyController } from "../../controllers/users/post-verify";
import { userPutController } from "../../controllers/users/put";

const router: Router = Router()

router.post('/', userPostController)
router.post('/code', userPostCodeController)
router.post('/verify', userPostVerifyController)
router.post('/login', userPostLoginController)
router.post('/refresh', userPostRefreshController)
router.put('/:_id', userPutController)

export default router