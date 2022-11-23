import { Router } from "express";

import { productPostController } from "../controllers/products/post";
import { productPutController } from "../controllers/products/put";
import { productPutImageController } from "../controllers/products/put-image";
import { productGetCategoriesController } from "../controllers/products/get-categories";
import { productGetSkusController } from "../controllers/products/get-skus";
import { productGetSearchController } from "../controllers/products/get";
import { productGetDetailsController } from "../controllers/products/get-details";

const router: Router = Router()

router.post('/', productPostController)
router.put('/:_id', productPutController)
router.put('/image/:_id', productPutImageController)
router.get('/categories', productGetCategoriesController)
router.get('/skus', productGetSkusController)
router.get('/', productGetSearchController)
router.get('/:_id', productGetDetailsController)

export default router