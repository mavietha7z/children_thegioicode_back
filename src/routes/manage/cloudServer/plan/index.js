import express from 'express';

import { controlAuthGetCloudServerPlans } from '~/controllers/manage/cloudServer/plan/get';
import { controlAuthCreateCloudServerPlan } from '~/controllers/manage/cloudServer/plan/create';
import { controlAuthUpdateCloudServerPlan } from '~/controllers/manage/cloudServer/plan/update';
import { controlAuthDestroyCloudServerPlan } from '~/controllers/manage/cloudServer/plan/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';
import { controlAuthInitializeCloudServerPlans } from '~/controllers/manage/cloudServer/plan/initialize';

const router = express.Router();

router.post('/create', controlAuthCreateCloudServerPlan);

router.get('/initialize', controlAuthInitializeCloudServerPlans);

router.get('/', validatorCheckPages, controlAuthGetCloudServerPlans);

router.put('/update', validatorMongoId, controlAuthUpdateCloudServerPlan);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerPlan);

export default router;
