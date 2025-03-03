import express from 'express';

import orderRouter from './order';
import imageRouter from './image';
import regionRouter from './region';
import productRouter from './product';

import { controlAuthGetCloudServerTryIt } from '~/controllers/manage/cloudServer/tryIt';

const router = express.Router();

router.use('/orders', orderRouter);

router.use('/images', imageRouter);

router.use('/regions', regionRouter);

router.use('/products', productRouter);

router.get('/try-it', controlAuthGetCloudServerTryIt);

export default router;
