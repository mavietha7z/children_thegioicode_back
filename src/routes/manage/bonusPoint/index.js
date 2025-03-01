import express from 'express';

import { controlAuthGetBonusPoints } from '~/controllers/manage/bonusPoint/get';
import { controlAuthDestroyBonusPoint } from '~/controllers/manage/bonusPoint/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetBonusPoints);

router.delete('/destroy', validatorMongoId, controlAuthDestroyBonusPoint);

export default router;
