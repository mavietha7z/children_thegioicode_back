import express from 'express';

import { controlAuthGetCloudServerPartner } from '~/controllers/manage/cloudServer/partner/get';
import { controlAuthCreateCloudServerPartner } from '~/controllers/manage/cloudServer/partner/create';
import { controlAuthUpdateCloudServerPartner } from '~/controllers/manage/cloudServer/partner/update';
import { controlAuthDestroyCloudServerPartner } from '~/controllers/manage/cloudServer/partner/destroy';

import { validatorMongoId } from '~/validators';
import { validatorAuthCreateCloudServerPartner } from '~/validators/manage/cloudServer/partner/create';
import { validatorAuthUpdateCloudServerPartner } from '~/validators/manage/cloudServer/partner/update';

const router = express.Router();

router.get('/', controlAuthGetCloudServerPartner);

router.delete('/destroy', validatorMongoId, controlAuthDestroyCloudServerPartner);

router.post('/create', validatorAuthCreateCloudServerPartner, controlAuthCreateCloudServerPartner);

router.put('/update', validatorMongoId, validatorAuthUpdateCloudServerPartner, controlAuthUpdateCloudServerPartner);

export default router;
