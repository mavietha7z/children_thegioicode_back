import express from 'express';

import { controlAuthGetCartUsers } from '~/controllers/manage/cart/get';
import { controlAuthUpdateCartUser } from '~/controllers/manage/cart/update';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetCartUsers);

router.put('/update', validatorMongoId, controlAuthUpdateCartUser);

export default router;
