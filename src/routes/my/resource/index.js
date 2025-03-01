import express from 'express';

import { controlUserGetResourceCategories, controlUserGetResourceCategoryBySlug } from '~/controllers/my/resource/get';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.get('/categories', validatorCheckPages, controlUserGetResourceCategories);

router.get('/categories/:slug_url', validatorCheckPages, controlUserGetResourceCategoryBySlug);

export default router;
