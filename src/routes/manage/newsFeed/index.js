import express from 'express';

import { controlAuthGetNewsFeed } from '~/controllers/manage/newsFeed/get';
import { controlAuthUpdateNewsFeed } from '~/controllers/manage/newsFeed/update';
import { controlAuthDestroyNewsFeed } from '~/controllers/manage/newsFeed/destroy';
import { controlAuthPublishNewsFeed } from '~/controllers/manage/newsFeed/publish';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.post('/publish', controlAuthPublishNewsFeed);

router.get('/', validatorCheckPages, controlAuthGetNewsFeed);

router.put('/update', validatorMongoId, controlAuthUpdateNewsFeed);

router.delete('/destroy', validatorMongoId, controlAuthDestroyNewsFeed);

export default router;
