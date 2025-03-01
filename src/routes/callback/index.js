import express from 'express';

import { controlCallbackRecharge } from '~/controllers/callback/recharge';

const router = express.Router();

router.post('/recharge', controlCallbackRecharge);

export default router;
