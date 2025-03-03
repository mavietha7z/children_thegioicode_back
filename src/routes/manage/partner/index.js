import express from 'express';

import { controlAuthGetPartners } from '~/controllers/manage/partner/get';
import { controlAuthCreatePartner } from '~/controllers/manage/partner/create';
import { controlAuthUpdatePartner } from '~/controllers/manage/partner/update';
import { controlAuthDestroyPartner } from '~/controllers/manage/partner/destroy';

import { validatorMongoId } from '~/validators';
import { validatorAuthCreatePartner } from '~/validators/manage/partner/create';
import { validatorAuthUpdatePartner } from '~/validators/manage/partner/update';

const router = express.Router();

router.get('/', controlAuthGetPartners);

router.delete('/destroy', validatorMongoId, controlAuthDestroyPartner);

router.post('/create', validatorAuthCreatePartner, controlAuthCreatePartner);

router.put('/update', validatorMongoId, validatorAuthUpdatePartner, controlAuthUpdatePartner);

export default router;
