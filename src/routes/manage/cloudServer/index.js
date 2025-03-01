import express from 'express';

import planRouter from './plan';
import orderRouter from './order';
import imageRouter from './image';
import regionRouter from './region';
import productRouter from './product';
import partnerRouter from './partner';

import { controlAuthGetCloudServerTryIt } from '~/controllers/manage/cloudServer/tryIt';

const router = express.Router();

router.use('/plans', planRouter);

router.use('/orders', orderRouter);

router.use('/images', imageRouter);

router.use('/regions', regionRouter);

router.use('/partners', partnerRouter);

router.use('/products', productRouter);

router.get('/try-it', controlAuthGetCloudServerTryIt);

export default router;
