import express from 'express';

import { controlAuthGetCloudServerImages } from '~/controllers/manage/cloudServer/image/get';
import { controlAuthAsyncCloudServerImage } from '~/controllers/manage/cloudServer/image/async';
import { controlAuthUpdateCloudServerImage } from '~/controllers/manage/cloudServer/image/update';
import { controlAuthDestroyCloudServerImage } from '~/controllers/manage/cloudServer/image/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/async', controlAuthAsyncCloudServerImage);

router.get('/', validatorCheckPages, controlAuthGetCloudServerImages);

router.put('/update', validatorMongoId, controlAuthUpdateCloudServerImage);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerImage);

export default router;
