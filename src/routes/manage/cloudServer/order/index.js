import express from 'express';

import { controlAuthGetCloudServerOrders } from '~/controllers/manage/cloudServer/order/get';
import { controlAuthAsyncCloudServerOrder } from '~/controllers/manage/cloudServer/order/async';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.get('/async', controlAuthAsyncCloudServerOrder);

router.get('/', validatorCheckPages, controlAuthGetCloudServerOrders);

export default router;
