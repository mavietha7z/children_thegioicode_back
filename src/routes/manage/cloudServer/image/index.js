import express from 'express';

import { controlAuthGetCloudServerImages } from '~/controllers/manage/cloudServer/image/get';
import { controlAuthAsyncCloudServerImage } from '~/controllers/manage/cloudServer/image/async';
import { controlAuthUpdateCloudServerImage } from '~/controllers/manage/cloudServer/image/update';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/async', controlAuthAsyncCloudServerImage);

router.get('/', validatorCheckPages, controlAuthGetCloudServerImages);

router.put('/update', validatorMongoId, controlAuthUpdateCloudServerImage);

export default router;
