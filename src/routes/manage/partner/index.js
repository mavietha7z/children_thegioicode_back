import express from 'express';

import { controlAuthGetPartners, controlAuthGetServices } from '~/controllers/manage/partner/get';
import { controlAuthUpdatePartner, controlAuthUpdateService } from '~/controllers/manage/partner/update';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

// Partner
router.get('/', validatorCheckPages, controlAuthGetPartners);

router.put('/update', validatorMongoId, controlAuthUpdatePartner);

// Services
router.get('/services', validatorCheckPages, controlAuthGetServices);

router.put('/services/update', validatorMongoId, controlAuthUpdateService);

export default router;
