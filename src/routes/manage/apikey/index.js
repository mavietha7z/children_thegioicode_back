import express from 'express';

import { controlAuthGetApiKeys } from '~/controllers/manage/apikey/get';
import { controlAuthUpdateApikey } from '~/controllers/manage/apikey/update';
import { controlAuthSearchApikeyByEmail } from '~/controllers/manage/apikey/search';

import { validatorAuthSearchKeyWord, validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetApiKeys);

router.put('/update', validatorMongoId, controlAuthUpdateApikey);

router.get('/search', validatorAuthSearchKeyWord, controlAuthSearchApikeyByEmail);

export default router;
