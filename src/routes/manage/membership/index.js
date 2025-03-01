import express from 'express';

import { controlAuthGetMemberships } from '~/controllers/manage/membership/get';
import { controlAuthUpdateMembership } from '~/controllers/manage/membership/update';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetMemberships);

router.put('/update', validatorMongoId, controlAuthUpdateMembership);

export default router;
