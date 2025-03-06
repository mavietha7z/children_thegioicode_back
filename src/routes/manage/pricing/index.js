import express from 'express';

import { controlAuthGetPricings } from '~/controllers/manage/pricing/get';
import { controlAuthCreatePricing } from '~/controllers/manage/pricing/create';
import { controlAuthUpdatePricing } from '~/controllers/manage/pricing/update';
import { controlAuthDestroyPricing } from '~/controllers/manage/pricing/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';
import { validatorAuthCreatePricing } from '~/validators/manage/pricing/create';
import { validatorAuthUpdatePricing } from '~/validators/manage/pricing/update';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetPricings);

router.delete('/destroy', validatorMongoId, controlAuthDestroyPricing);

router.post('/create', validatorAuthCreatePricing, controlAuthCreatePricing);

router.put('/update', validatorMongoId, validatorAuthUpdatePricing, controlAuthUpdatePricing);

export default router;
