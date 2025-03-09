import express from 'express';

import { controlAuthCreateSource } from '~/controllers/manage/source/create';
import { controlAuthUpdateSource } from '~/controllers/manage/source/update';
import { controlAuthGetOrdersSources, controlAuthGetSources } from '~/controllers/manage/source/get';
import { controlAuthDestroyOrderSource, controlAuthDestroySource } from '~/controllers/manage/source/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';
import { validatorAuthCreateSource } from '~/validators/manage/source/create';
import { validatorAuthUpdateSource } from '~/validators/manage/source/update';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetSources);

router.delete('/destroy', validatorMongoId, controlAuthDestroySource);

router.post('/create', validatorAuthCreateSource, controlAuthCreateSource);

router.put('/update', validatorMongoId, validatorAuthUpdateSource, controlAuthUpdateSource);

// Order
router.get('/orders', validatorCheckPages, controlAuthGetOrdersSources);

router.delete('/orders/destroy', validatorMongoId, controlAuthDestroyOrderSource);

export default router;
