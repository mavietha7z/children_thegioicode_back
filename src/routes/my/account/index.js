import express from 'express';

import { controlUserUpdateProfile } from '~/controllers/my/account/profile';
import { controlUserCreatePartner } from '~/controllers/my/account/partner';
import { controlUserGetHistoryLogin } from '~/controllers/my/account/historyLogin';
import { controlUserGetApiKeys, controlUserUpdateApiKey } from '~/controllers/my/account/apikey';
import { controlUserChangePassword, controlUserVerifyPassword } from '~/controllers/my/account/password';
import { controlUserExchangeBonusPoint, controlUserGetBonusPoints } from '~/controllers/my/account/bonusPoint';
import { controlUserEnable2Fa, controlUserTurnoff2Fa, controlUserVerify2Fa } from '~/controllers/my/account/2fa';
import { controlUserGetNotifications, controlUserUnreadNotification } from '~/controllers/my/account/notification';

import { validatorCheckPages } from '~/validators';
import { validatorUserUpdateApikey } from '~/validators/my/account/apikey';
import { validatorUserUpdateProfile } from '~/validators/my/account/profile';
import { validatorUserChangePassword } from '~/validators/my/account/password';
import { validatorUserEnable2Fa, validatorUserVerify2Fa } from '~/validators/my/account/2fa';

const router = express.Router();

router.get('/apikey', controlUserGetApiKeys);

router.post('/partner', controlUserCreatePartner);

router.get('/notifications', controlUserGetNotifications);

router.post('/verify-password', controlUserVerifyPassword);

router.post('/notifications/unread', controlUserUnreadNotification);

router.post('/bonus-points/exchange', controlUserExchangeBonusPoint);

router.get('/bonus-points', validatorCheckPages, controlUserGetBonusPoints);

router.put('/profile', validatorUserUpdateProfile, controlUserUpdateProfile);

router.get('/history-login', validatorCheckPages, controlUserGetHistoryLogin);

router.put('/apikey/update', validatorUserUpdateApikey, controlUserUpdateApiKey);

router.post('/security/enable-2fa', validatorUserEnable2Fa, controlUserEnable2Fa);

router.post('/security/verify-2fa', validatorUserVerify2Fa, controlUserVerify2Fa);

router.post('/security/turnoff-2fa', validatorUserVerify2Fa, controlUserTurnoff2Fa);

router.post('/password-change', validatorUserChangePassword, controlUserChangePassword);

export default router;
