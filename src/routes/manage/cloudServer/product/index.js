import express from 'express';

import { controlAuthGetCloudServerProduct } from '~/controllers/manage/cloudServer/product/get';
import { controlAuthCreateCloudServerProduct } from '~/controllers/manage/cloudServer/product/create';
import { controlAuthUpdateCloudServerProduct } from '~/controllers/manage/cloudServer/product/update';
import { controlAuthDestroyCloudServerProduct } from '~/controllers/manage/cloudServer/product/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.post('/create', controlAuthCreateCloudServerProduct);

router.get('/', validatorCheckPages, controlAuthGetCloudServerProduct);

router.put('/update', validatorMongoId, controlAuthUpdateCloudServerProduct);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerProduct);

export default router;
