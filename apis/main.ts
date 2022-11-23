import { Router } from "express";
import { mainGetOverviewController } from "../controllers/main/get-overview";

const router: Router = Router()

router.get('/', mainGetOverviewController)

export default router