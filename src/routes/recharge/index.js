import express from 'express';

import { controlRechargeCardCallback } from '~/controllers/recharge/chargeCard';
import { controlRechargeBankTransferCallback } from '~/controllers/recharge/bankTransfer';

const router = express.Router();

router.post('/callback', controlRechargeCardCallback);

router.post('/bank-transfer', controlRechargeBankTransferCallback);

export default router;
