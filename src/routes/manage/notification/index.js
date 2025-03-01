import express from 'express';

import { controlAuthGetNotifications } from '~/controllers/manage/notification/get';
import { controlAuthDestroyNotification } from '~/controllers/manage/notification/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetNotifications);

router.delete('/destroy', validatorMongoId, controlAuthDestroyNotification);

export default router;
