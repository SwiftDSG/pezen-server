import { Router } from "express";

import { restaurantPostController } from "../../controllers/restaurants/post";
import { restaurantPutController } from "../../controllers/restaurants/put";
import { restaurantGetDataController } from "../../controllers/restaurants/get-data";
import { restaurantGetMenusController } from "../../controllers/restaurants/get-menus";

const router: Router = Router()

router.post('/', restaurantPostController)
router.put('/', restaurantPutController)
router.get('/data', restaurantGetDataController)
router.get('/menus', restaurantGetMenusController)

export default router