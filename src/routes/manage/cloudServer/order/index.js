import express from 'express';

import { controlAuthGetCloudServerOrders } from '~/controllers/manage/cloudServer/order/get';
import { controlAuthCreateCloudServerOrder } from '~/controllers/manage/cloudServer/order/create';
import { controlAuthDestroyCloudServerOrder } from '~/controllers/manage/cloudServer/order/destroy';
import { controlAuthChangePasswordCloudServerOrder } from '~/controllers/manage/cloudServer/order/password';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.post('/create', controlAuthCreateCloudServerOrder);

router.post('/password', controlAuthChangePasswordCloudServerOrder);

router.get('/', validatorCheckPages, controlAuthGetCloudServerOrders);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerOrder);

export default router;
