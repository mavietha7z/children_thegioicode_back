import express from 'express';

import { controlUserGetCart } from '~/controllers/my/cart/get';
import { controlUserPaymentCart } from '~/controllers/my/cart/payment';
import { controlUserAddProductToCart } from '~/controllers/my/cart/add';
import { controlUserChangeCycles, controlUserClearCart } from '~/controllers/my/cart/update';
import { controlUserApplyCoupon, controlUserRemoveCoupon } from '~/controllers/my/cart/coupon';

import { validatorUserClearCart } from '~/validators/my/cart/clear';

const router = express.Router();

router.get('/', controlUserGetCart);

router.put('/cycles', controlUserChangeCycles);

router.post('/payment', controlUserPaymentCart);

router.post('/apply-coupon', controlUserApplyCoupon);

router.post('/add/:category', controlUserAddProductToCart);

router.get('/remove-coupon/:coupon_id', controlUserRemoveCoupon);

router.put('/clear', validatorUserClearCart, controlUserClearCart);

export default router;
