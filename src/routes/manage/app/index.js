import express from 'express';

import { controlAuthGetConfigSendMail, controlAuthGetInfoApps } from '~/controllers/manage/app/get';
import { controlAuthUpdateConfigSendMail, controlAuthUpdateInfoApps } from '~/controllers/manage/app/update';

import { validateAuthUpdateConfigSendMail, validateAuthUpdateInfoApps } from '~/validators/manage/app/update';

const router = express.Router();

router.get('/info', controlAuthGetInfoApps);

router.get('/sendmail-config', controlAuthGetConfigSendMail);

router.put('/info/update', validateAuthUpdateInfoApps, controlAuthUpdateInfoApps);

router.put('/sendmail-config/update', validateAuthUpdateConfigSendMail, controlAuthUpdateConfigSendMail);

export default router;
