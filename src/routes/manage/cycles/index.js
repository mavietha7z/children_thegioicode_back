import express from 'express';

import { controlAuthGetCycles } from '~/controllers/manage/cycles/get';
import { controlAuthCreateCycles } from '~/controllers/manage/cycles/create';
import { controlAuthUpdateCycles } from '~/controllers/manage/cycles/update';
import { controlAuthDestroyCycles } from '~/controllers/manage/cycles/destroy';
import { controlAuthGetCyclesInitialize } from '~/controllers/manage/cycles/initialize';

import { validatorCheckPages, validatorMongoId } from '~/validators';
import { validatorAuthCreateCycles } from '~/validators/manage/cycles/create';
import { validatorAuthUpdateCycles } from '~/validators/manage/cycles/update';

const router = express.Router();

router.get('/initialize', controlAuthGetCyclesInitialize);

router.get('/', validatorCheckPages, controlAuthGetCycles);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCycles);

router.post('/create', validatorAuthCreateCycles, controlAuthCreateCycles);

router.put('/update', validatorMongoId, validatorAuthUpdateCycles, controlAuthUpdateCycles);

export default router;
