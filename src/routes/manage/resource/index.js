import express from 'express';

import accountRouter from './account';
import productRouter from './product';
import categoryRouter from './category';

const router = express.Router();

router.use('/accounts', accountRouter);

router.use('/products', productRouter);

router.use('/categories', categoryRouter);

export default router;
