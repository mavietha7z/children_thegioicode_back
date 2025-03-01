import express from 'express';

import { controlUserGetCloudServerImages } from '~/controllers/my/cloudServer/image';
import { controlUserGetCloudServerRegions } from '~/controllers/my/cloudServer/region';
import { controlUserGetCloudServerProducts } from '~/controllers/my/cloudServer/product';

import { middlewareUserVerifyTokenPartner } from '~/middleware/cloudServer';

const router = express.Router();

router.get('/images', controlUserGetCloudServerImages);

router.get('/regions', controlUserGetCloudServerRegions);

router.get('/products/:plan_id', middlewareUserVerifyTokenPartner('CloudServer'), controlUserGetCloudServerProducts);

export default router;
