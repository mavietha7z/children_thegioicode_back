import express from 'express';

import { controlAuthGetCoupons } from '~/controllers/manage/coupon/get';
import { controlAuthSearchCoupon } from '~/controllers/manage/coupon/search';
import { controlAuthCreateCoupon } from '~/controllers/manage/coupon/create';
import { controlAuthUpdateCoupon } from '~/controllers/manage/coupon/update';
import { controlAuthDestroyCoupon } from '~/controllers/manage/coupon/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';
import { validatorAuthCreateCoupon } from '~/validators/manage/coupon/create';

const router = express.Router();

router.post('/search', controlAuthSearchCoupon);

router.get('/', validatorCheckPages, controlAuthGetCoupons);

router.put('/update', validatorMongoId, controlAuthUpdateCoupon);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCoupon);

router.post('/create', validatorAuthCreateCoupon, controlAuthCreateCoupon);

export default router;
