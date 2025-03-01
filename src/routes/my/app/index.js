import express from 'express';
import middleware from '~/middleware';

import { controlUserGetConfigApps, controlUserGetNewsFeeds, controlUserLikeNewsFeeds } from '~/controllers/my/app/get';

const router = express.Router();

router.get('/', controlUserGetConfigApps);

router.get('/news-feeds', controlUserGetNewsFeeds);

router.post('/news-feeds/like', middleware.verifyUser, controlUserLikeNewsFeeds);

export default router;
