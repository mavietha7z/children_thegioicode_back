import express from 'express';

import { controlUserGetConfigApps } from '~/controllers/my/app/get';

const router = express.Router();

router.get('/', controlUserGetConfigApps);

export default router;
