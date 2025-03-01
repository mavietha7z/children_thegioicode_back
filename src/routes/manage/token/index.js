import express from 'express';

import { controlAuthGetTokenUsers } from '~/controllers/manage/token/get';
import { controlAuthDestroyTokenUser } from '~/controllers/manage/token/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetTokenUsers);

router.delete('/destroy', validatorMongoId, controlAuthDestroyTokenUser);

export default router;
