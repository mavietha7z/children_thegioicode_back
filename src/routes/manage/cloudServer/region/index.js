import express from 'express';

import { controlAuthGetCloudServerRegions } from '~/controllers/manage/cloudServer/region/get';
import { controlAuthAsyncCloudServerRegion } from '~/controllers/manage/cloudServer/region/async';
import { controlAuthUpdateCloudServerRegion } from '~/controllers/manage/cloudServer/region/update';
import { controlAuthDestroyCloudServerRegion } from '~/controllers/manage/cloudServer/region/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/async', controlAuthAsyncCloudServerRegion);

router.get('/', validatorCheckPages, controlAuthGetCloudServerRegions);

router.put('/update', validatorMongoId, controlAuthUpdateCloudServerRegion);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerRegion);

export default router;
