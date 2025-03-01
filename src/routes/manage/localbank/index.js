import express from 'express';

import { controlAuthGetLocalbanks } from '~/controllers/manage/localbank/get';
import { controlAuthCreateLocalbank } from '~/controllers/manage/localbank/create';
import { controlAuthUpdateLocalbank } from '~/controllers/manage/localbank/update';
import { controlAuthDestroyLocalbank } from '~/controllers/manage/localbank/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';
import { validatorAuthCreateLocalbank } from '~/validators/manage/localbank/create';
import { validatorAuthUpdateLocalbank } from '~/validators/manage/localbank/update';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetLocalbanks);

router.delete('/destroy', validatorMongoId, controlAuthDestroyLocalbank);

router.post('/create', validatorAuthCreateLocalbank, controlAuthCreateLocalbank);

router.put('/update', validatorMongoId, validatorAuthUpdateLocalbank, controlAuthUpdateLocalbank);

export default router;
