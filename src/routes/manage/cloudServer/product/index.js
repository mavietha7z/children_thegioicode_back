import express from 'express';

import { controlAuthGetCloudServerProduct } from '~/controllers/manage/cloudServer/product/get';
import { controlAuthAsyncCloudServerProduct } from '~/controllers/manage/cloudServer/product/async';
import { controlAuthUpdateCloudServerProduct } from '~/controllers/manage/cloudServer/product/update';
import { controlAuthDestroyCloudServerProduct } from '~/controllers/manage/cloudServer/product/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/async', controlAuthAsyncCloudServerProduct);

router.get('/', validatorCheckPages, controlAuthGetCloudServerProduct);

router.put('/update', validatorMongoId, controlAuthUpdateCloudServerProduct);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerProduct);

export default router;
