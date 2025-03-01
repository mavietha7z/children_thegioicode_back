import express from 'express';
import middleware from '~/middleware';

import { controlAuthLogin } from '~/controllers/manage/auth/login';
import { controlAuthLogout } from '~/controllers/manage/auth/logout';
import { controlAuthGetCurrent } from '~/controllers/manage/auth/get';
import { controlAuthVerifyLoginEmail } from '~/controllers/manage/auth/verifyLogin';
import { controlUserUnreadNotification } from '~/controllers/my/account/notification';
import { controlAuthGetCurrentNotifications } from '~/controllers/manage/auth/notification';

import { validatorLogin } from '~/validators/auth/login';

const router = express.Router();

router.post('/login', validatorLogin, controlAuthLogin);

router.post('/logout', middleware.verifyAuth, controlAuthLogout);

router.post('/verify-login', validatorLogin, controlAuthVerifyLoginEmail);

router.get('/current-user', middleware.verifyAuth, controlAuthGetCurrent);

router.get('/notifications', middleware.verifyAuth, controlAuthGetCurrentNotifications);

router.post('/notifications/unread', middleware.verifyAuth, controlUserUnreadNotification);

export default router;
