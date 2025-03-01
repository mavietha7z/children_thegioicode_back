import express from 'express';
import { controlAuthGetResourceAccounts } from '~/controllers/manage/resource/account/get';
import { controlAuthUpdateResourceAccount } from '~/controllers/manage/resource/account/update';
import { controlAuthCreateResourceAccount } from '~/controllers/manage/resource/account/create';
import { controlAuthDestroyResourceAccount } from '~/controllers/manage/resource/account/destroy';
import { controlAuthGetInitializeResourceAccount } from '~/controllers/manage/resource/account/initialize';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.post('/create', controlAuthCreateResourceAccount);

router.get('/initialize', controlAuthGetInitializeResourceAccount);

router.get('/', validatorCheckPages, controlAuthGetResourceAccounts);

router.put('/update', validatorMongoId, controlAuthUpdateResourceAccount);

router.delete('/destroy', validatorMongoId, controlAuthDestroyResourceAccount);

export default router;
