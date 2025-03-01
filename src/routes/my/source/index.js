import express from 'express';

import { controlUserGetSourceBySlug, controlUserGetSources } from '~/controllers/my/source/get';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.get('/:slug_url', controlUserGetSourceBySlug);

router.get('/', validatorCheckPages, controlUserGetSources);

export default router;
