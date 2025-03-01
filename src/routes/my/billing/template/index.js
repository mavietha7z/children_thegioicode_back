import express from 'express';

import { controlUserBillingActionTemplate } from '~/controllers/my/billing/template/action';
import { controlUserBillingGetTemplates, controlUserBillingGetTemplateDetail } from '~/controllers/my/billing/template/get';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.get('/:template_id', controlUserBillingGetTemplateDetail);

router.get('/', validatorCheckPages, controlUserBillingGetTemplates);

router.get('/:action/:template_id', controlUserBillingActionTemplate);

export default router;
