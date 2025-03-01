import express from 'express';

import { controlAuthGetCloudServerRegions } from '~/controllers/manage/cloudServer/region/get';
import { controlAuthCreateCloudServerRegion } from '~/controllers/manage/cloudServer/region/create';
import { controlAuthUpdateCloudServerRegion } from '~/controllers/manage/cloudServer/region/update';
import { controlAuthDestroyCloudServerRegion } from '~/controllers/manage/cloudServer/region/destroy';
import { controlAuthAddPlanToRegion, controlAuthRemovePlanInRegion } from '~/controllers/manage/cloudServer/region/plan';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.post('/add-plan', controlAuthAddPlanToRegion);

router.post('/create', controlAuthCreateCloudServerRegion);

router.post('/remove-plan', controlAuthRemovePlanInRegion);

router.get('/', validatorCheckPages, controlAuthGetCloudServerRegions);

router.put('/update', validatorMongoId, controlAuthUpdateCloudServerRegion);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerRegion);

export default router;
