import express from 'express';

import { controlAuthGetChargings } from '~/controllers/manage/charging/get';
import { controlAuthDestroyCharging } from '~/controllers/manage/charging/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetChargings);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCharging);

export default router;
