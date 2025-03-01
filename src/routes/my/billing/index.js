import express from 'express';

import { controlUserGetRecharge } from '~/controllers/my/billing/recharge';
import { controlUserGetWalletHistory } from '~/controllers/my/billing/balance';

import { validatorCheckPages } from '~/validators';

import orderRouter from './order';
import invoiceRouter from './invoice';
import templateRouter from './template';
import instanceRouter from './instance';

const router = express.Router();

router.use('/orders', orderRouter);

router.use('/invoices', invoiceRouter);

router.use('/templates', templateRouter);

router.use('/instances', instanceRouter);

// Nạp tiền
router.get('/recharge', controlUserGetRecharge);

// Biến động số dư
router.get('/balances', validatorCheckPages, controlUserGetWalletHistory);

export default router;
