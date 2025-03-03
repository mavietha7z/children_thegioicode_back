import express from 'express';
import middleware from '~/middleware';

import appRouter from './app';
import apiRouter from './api';
import authRouter from './auth';
import userRouter from './user';
import cartRouter from './cart';
import orderRouter from './order';
import tokenRouter from './token';
import couponRouter from './coupon';
import cyclesRouter from './cycles';
import sourceRouter from './source';
import walletRouter from './wallet';
import apikeyRouter from './apikey';
import invoiceRouter from './invoice';
import paygateRouter from './paygate';
import pricingRouter from './pricing';
import partnerRouter from './partner';
import templateRouter from './template';
import databaseRouter from './database';
import userbankRouter from './userbank';
import localbankRouter from './localbank';
import bonusPointRouter from './bonusPoint';
import membershipRouter from './membership';
import cloudServerRouter from './cloudServer';
import notificationRouter from './notification';

import { controlAuthGetDataDashboard } from '~/controllers/manage/dashboard/get';

const router = express.Router();

router.use('/auth', authRouter);

router.use('/apis', middleware.verifyAuth, apiRouter);

router.use('/apps', middleware.verifyAuth, appRouter);

router.use('/cart', middleware.verifyAuth, cartRouter);

router.use('/users', middleware.verifyAuth, userRouter);

router.use('/tokens', middleware.verifyAuth, tokenRouter);

router.use('/orders', middleware.verifyAuth, orderRouter);

router.use('/cycles', middleware.verifyAuth, cyclesRouter);

router.use('/apikey', middleware.verifyAuth, apikeyRouter);

router.use('/sources', middleware.verifyAuth, sourceRouter);

router.use('/wallets', middleware.verifyAuth, walletRouter);

router.use('/coupons', middleware.verifyAuth, couponRouter);

router.use('/partners', middleware.verifyAuth, partnerRouter);

router.use('/pricings', middleware.verifyAuth, pricingRouter);

router.use('/invoices', middleware.verifyAuth, invoiceRouter);

router.use('/paygates', middleware.verifyAuth, paygateRouter);

router.use('/templates', middleware.verifyAuth, templateRouter);

router.use('/databases', middleware.verifyAuth, databaseRouter);

router.use('/userbanks', middleware.verifyAuth, userbankRouter);

router.use('/localbank', middleware.verifyAuth, localbankRouter);

router.use('/memberships', middleware.verifyAuth, membershipRouter);

router.use('/bonus-points', middleware.verifyAuth, bonusPointRouter);

router.use('/cloud-server', middleware.verifyAuth, cloudServerRouter);

router.use('/notifications', middleware.verifyAuth, notificationRouter);

router.get('/dashboard', middleware.verifyAuth, controlAuthGetDataDashboard);

export default router;
