import express from 'express';

import { controlV2CloudServerDeploy } from '~/controllers/v2/cloudServer/deploy';
import { controlV2CloudServerAction } from '~/controllers/v2/cloudServer/action';
import { controlV2CloudServerGetImages } from '~/controllers/v2/cloudServer/image';
import { controlV2CloudServerRebuild } from '~/controllers/v2/cloudServer/rebuild';
import { controlV2CloudServerGetRegions } from '~/controllers/v2/cloudServer/region';
import { controlV2CloudServerGetProducts } from '~/controllers/v2/cloudServer/product';
import { controlV2CloudServerGetOrderByID, controlV2CloudServerGetOrders } from '~/controllers/v2/cloudServer/order';
import { controlV2CloudServerGetRenewInfo, controlV2CloudServerRenewOrder } from '~/controllers/v2/cloudServer/renew';
import { controlV2CloudServerGetResizeInfo, controlV2CloudServerResizeOrder } from '~/controllers/v2/cloudServer/resize';

import { validatorCheckPages } from '~/validators';
import { middlewareVerifyPartner } from '~/middleware/v2';

const router = express.Router();

router.post('/deploy', middlewareVerifyPartner('CloudServer'), controlV2CloudServerDeploy);

router.post('/action', middlewareVerifyPartner('CloudServer'), controlV2CloudServerAction);

router.post('/rebuild', middlewareVerifyPartner('CloudServer'), controlV2CloudServerRebuild);

router.get('/images', middlewareVerifyPartner('CloudServer'), controlV2CloudServerGetImages);

router.post('/renew', middlewareVerifyPartner('CloudServer'), controlV2CloudServerRenewOrder);

router.get('/regions', middlewareVerifyPartner('CloudServer'), controlV2CloudServerGetRegions);

router.post('/resize', middlewareVerifyPartner('CloudServer'), controlV2CloudServerResizeOrder);

router.get('/renew/:order_id', middlewareVerifyPartner('CloudServer'), controlV2CloudServerGetRenewInfo);

router.get('/products/:plan_id', middlewareVerifyPartner('CloudServer'), controlV2CloudServerGetProducts);

router.get('/orders/:order_id', middlewareVerifyPartner('CloudServer'), controlV2CloudServerGetOrderByID);

router.get('/resize/:order_id', middlewareVerifyPartner('CloudServer'), controlV2CloudServerGetResizeInfo);

router.get('/orders', middlewareVerifyPartner('CloudServer'), validatorCheckPages, controlV2CloudServerGetOrders);

export default router;
