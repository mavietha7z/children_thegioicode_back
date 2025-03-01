import express from 'express';

import { controlAuthCreateUserbank } from '~/controllers/manage/userbank/create';
import { controlAuthUpdateUserbank } from '~/controllers/manage/userbank/update';
import { controlAuthDestroyUserbank } from '~/controllers/manage/userbank/destroy';
import { controlAuthGetUserbanks, controlAuthSearchUserbank } from '~/controllers/manage/userbank/get';

import { validatorAuthCreateUserBank } from '~/validators/manage/userbank/create';
import { validatorAuthUpdateUserBank } from '~/validators/manage/userbank/update';
import { validatorAuthSearchKeyWord, validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetUserbanks);

router.delete('/destroy', validatorMongoId, controlAuthDestroyUserbank);

router.post('/create', validatorAuthCreateUserBank, controlAuthCreateUserbank);

router.get('/create-search', validatorAuthSearchKeyWord, controlAuthSearchUserbank);

router.put('/update', validatorMongoId, validatorAuthUpdateUserBank, controlAuthUpdateUserbank);

export default router;
