import express from 'express';

import { controlAuthGetCloudServerImages } from '~/controllers/manage/cloudServer/image/get';
import { controlAuthCreateCloudServerImage } from '~/controllers/manage/cloudServer/image/create';
import { controlAuthUpdateCloudServerImage } from '~/controllers/manage/cloudServer/image/update';
import { controlAuthDestroyCloudServerImage } from '~/controllers/manage/cloudServer/image/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.post('/create', controlAuthCreateCloudServerImage);

router.get('/', validatorCheckPages, controlAuthGetCloudServerImages);

router.put('/update', validatorMongoId, controlAuthUpdateCloudServerImage);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerImage);

export default router;
