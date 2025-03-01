import express from 'express';

import { controlAuthCreatePaygate, controlAuthCreateOptionPaygate } from '~/controllers/manage/paygate/create';
import { controlAuthUpdateOptionPayGate, controlAuthUpdatePayGate } from '~/controllers/manage/paygate/update';
import { controlAuthDestroyOptionPaygate, controlAuthDestroyPaygate } from '~/controllers/manage/paygate/destroy';
import { controlAuthGetOptionsPaygates, controlAuthGetPaygates, controlAuthGetUserbanks } from '~/controllers/manage/paygate/get';

import { validatorMongoId } from '~/validators';
import { validatorAuthCreatePaygate } from '~/validators/manage/paygate/create';
import { validatorAuthUpdatePaygate } from '~/validators/manage/paygate/update';

const router = express.Router();

router.get('/', controlAuthGetPaygates);

router.get('/options/userbanks', controlAuthGetUserbanks);

router.put('/options/update', controlAuthUpdateOptionPayGate);

router.post('/options/create', controlAuthCreateOptionPaygate);

router.put('/options/destroy', controlAuthDestroyOptionPaygate);

router.delete('/destroy', validatorMongoId, controlAuthDestroyPaygate);

router.get('/options', validatorMongoId, controlAuthGetOptionsPaygates);

router.post('/create', validatorAuthCreatePaygate, controlAuthCreatePaygate);

router.put('/update', validatorMongoId, validatorAuthUpdatePaygate, controlAuthUpdatePayGate);

export default router;
