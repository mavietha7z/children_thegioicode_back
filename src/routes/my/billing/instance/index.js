import express from 'express';

import { controlUserBillingResizeInstance } from '~/controllers/my/billing/instance/resize';
import { controlUserBillingActionInstance } from '~/controllers/my/billing/instance/action';
import { controlUserBillingRenameInstance } from '~/controllers/my/billing/instance/rename';
import { controlUserBillingRebuildInstance } from '~/controllers/my/billing/instance/rebuild';
import { controlUserBillingGetInstanceDetail, controlUserBillingGetInstances } from '~/controllers/my/billing/instance/get';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.post('/resize', controlUserBillingResizeInstance);

router.post('/rename', controlUserBillingRenameInstance);

router.post('/rebuild', controlUserBillingRebuildInstance);

router.get('/:instance_id', controlUserBillingGetInstanceDetail);

router.get('/', validatorCheckPages, controlUserBillingGetInstances);

router.get('/:action/:instance_id', controlUserBillingActionInstance);

export default router;
