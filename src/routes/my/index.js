import express from 'express';
import middleware from '~/middleware';

import appRouter from './app';
import apiRouter from './api';
import authRouter from './auth';
import cartRouter from './cart';
import usingRouter from './using';
import sourceRouter from './source';
import accountRouter from './account';
import billingRouter from './billing';
import templateRouter from './template';
import cloudServerRouter from './cloudServer';

const router = express.Router();

router.use('/apps', appRouter);

router.use('/apis', apiRouter);

router.use('/auth', authRouter);

router.use('/sources', sourceRouter);

router.use('/templates', templateRouter);

router.use('/cloud-server', cloudServerRouter);

router.use('/cart', middleware.verifyUser, cartRouter);

router.use('/usings', middleware.verifyUser, usingRouter);

router.use('/billings', middleware.verifyUser, billingRouter);

router.use('/accounts', middleware.verifyUser, accountRouter);

export default router;
