import express from 'express';

import { controlAuthGetResourceCategories } from '~/controllers/manage/resource/category/get';
import { controlAuthCreateResourceCategory } from '~/controllers/manage/resource/category/create';
import { controlAuthUpdateResourceCategory } from '~/controllers/manage/resource/category/update';
import { controlAuthDestroyResourceCategory } from '~/controllers/manage/resource/category/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.post('/create', controlAuthCreateResourceCategory);

router.get('/', validatorCheckPages, controlAuthGetResourceCategories);

router.put('/update', validatorMongoId, controlAuthUpdateResourceCategory);

router.delete('/destroy', validatorMongoId, controlAuthDestroyResourceCategory);

export default router;
