import express from 'express';

import { controlUserBillingGetSources } from '~/controllers/my/billing/source/get';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlUserBillingGetSources);

export default router;
