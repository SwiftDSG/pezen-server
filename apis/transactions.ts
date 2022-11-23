import { Router } from "express";

import { transactionPostController } from "../controllers/transactions/post";
import { transactionPutCancelController } from "../controllers/transactions/put-cancel";
import { transactionPutFileController } from "../controllers/transactions/put-file";
import { transactionPutDeliverController } from "../controllers/transactions/put-deliver";
import { transactionPutPaymentCreateController } from "../controllers/transactions/put-payment-create";
import { transactionPutPaymentFulFillController } from "../controllers/transactions/put-payment-fulfill";
import { transactionPutPaymentWarnController } from "../controllers/transactions/put-payment-warn";
import { transactionGetAvailableDeliveriesController } from "../controllers/transactions/get-deliveries-available";
import { transactionGetDeliveriesController } from "../controllers/transactions/get-deliveries";
import { transactionGetPaymentsController } from "../controllers/transactions/get-payments";
import { transactionGetSearchController } from "../controllers/transactions/get";
import { transactionGetOverviewController } from "../controllers/transactions/get-overview";
import { transactionGetDetailsController } from "../controllers/transactions/get-details";
import { transactionPutReceiveController } from "../controllers/transactions/put-receive";
import { transactionGetUnfinishedController } from "../controllers/transactions/get-unfinished";

const router: Router = Router()

router.post('/', transactionPostController)
router.put('/cancel/:_id', transactionPutCancelController)
router.put('/file/:_id', transactionPutFileController)
router.put('/deliver/:_id', transactionPutDeliverController)
router.put('/receive/:_id', transactionPutReceiveController)
router.put('/payment/create/:_id', transactionPutPaymentCreateController)
router.put('/payment/fulfill/:_id', transactionPutPaymentFulFillController)
router.put('/payment/warn/:_id', transactionPutPaymentWarnController)
router.get('/deliveries/available/:_id', transactionGetAvailableDeliveriesController)
router.get('/deliveries/:_id', transactionGetDeliveriesController)
router.get('/payments/:_id', transactionGetPaymentsController)
router.get('/overview', transactionGetOverviewController)
router.get('/unfinished', transactionGetUnfinishedController)
router.get('/', transactionGetSearchController)
router.get('/:_id', transactionGetDetailsController)

export default router