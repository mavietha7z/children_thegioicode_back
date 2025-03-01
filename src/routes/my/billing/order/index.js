import express from 'express';

import { controlUserCanceledOrder } from '~/controllers/my/billing/order/cancel';
import { controlUserPaymentOrder } from '~/controllers/my/billing/order/payment';
import { controlUserGetOrderDetail, controlUserGetOrders } from '~/controllers/my/billing/order/get';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.get('/:order_id', controlUserGetOrderDetail);

router.get('/', validatorCheckPages, controlUserGetOrders);

router.post('/payment/:order_id', controlUserPaymentOrder);

router.post('/canceled/:order_id', controlUserCanceledOrder);

export default router;
