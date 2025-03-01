import express from 'express';
import { controlAuthGetResourceProducts } from '~/controllers/manage/resource/product/get';
import { controlAuthUpdateResourceProduct } from '~/controllers/manage/resource/product/update';
import { controlAuthCreateResourceProduct } from '~/controllers/manage/resource/product/create';
import { controlAuthDestroyResourceProduct } from '~/controllers/manage/resource/product/destroy';
import { controlAuthGetInitializeResourceProduct } from '~/controllers/manage/resource/product/initialize';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.post('/create', controlAuthCreateResourceProduct);

router.get('/initialize', controlAuthGetInitializeResourceProduct);

router.get('/', validatorCheckPages, controlAuthGetResourceProducts);

router.put('/update', validatorMongoId, controlAuthUpdateResourceProduct);

router.delete('/destroy', validatorMongoId, controlAuthDestroyResourceProduct);

export default router;
