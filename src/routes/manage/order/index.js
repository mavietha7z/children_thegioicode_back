import express from 'express';

import { controlAuthGetOrders } from '~/controllers/manage/order/get';
import { controlAuthDestroyOrder } from '~/controllers/manage/order/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetOrders);

router.delete('/destroy', validatorMongoId, controlAuthDestroyOrder);

export default router;
