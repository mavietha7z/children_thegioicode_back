import express from 'express';

import { controlAuthCreatePricing } from '~/controllers/manage/pricing/create';
import { controlAuthUpdatePricing } from '~/controllers/manage/pricing/update';
import { controlAuthDestroyPricing } from '~/controllers/manage/pricing/destroy';
import { controlAuthGetPricings, controlAuthSearchPricing } from '~/controllers/manage/pricing/get';

import { validatorAuthCreatePricing } from '~/validators/manage/pricing/create';
import { validatorAuthUpdatePricing } from '~/validators/manage/pricing/update';
import { validatorAuthSearchKeyWord, validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetPricings);

router.delete('/destroy', validatorMongoId, controlAuthDestroyPricing);

router.get('/search', validatorAuthSearchKeyWord, controlAuthSearchPricing);

router.post('/create', validatorAuthCreatePricing, controlAuthCreatePricing);

router.put('/update', validatorMongoId, validatorAuthUpdatePricing, controlAuthUpdatePricing);

export default router;
