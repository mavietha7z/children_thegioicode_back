import express from 'express';

import { controlUserGetApiBySlug, controlUserGetApis } from '~/controllers/my/api/get';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.get('/:slug', controlUserGetApiBySlug);

router.get('/', validatorCheckPages, controlUserGetApis);

export default router;
