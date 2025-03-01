import express from 'express';
import middleware from '~/middleware';

import { controlUserPaymentTemplate } from '~/controllers/my/template/payment';
import { controlUserGetTemplateBySlug, controlUserGetTemplates } from '~/controllers/my/template/get';

import { validatorCheckPages } from '~/validators';
import { validatorUserPaymentTemplate } from '~/validators/my/template/payment';

const router = express.Router();

router.get('/:slug_url', controlUserGetTemplateBySlug);

router.get('/', validatorCheckPages, controlUserGetTemplates);

router.post('/payment', middleware.verifyUser, validatorUserPaymentTemplate, controlUserPaymentTemplate);

export default router;
