import express from 'express';

import { controlAuthCreateTemplate } from '~/controllers/manage/template/create';
import { controlAuthSearchOrderTemplate } from '~/controllers/manage/template/search';
import { controlAuthGetTemplates, controlAuthGetOrdersTemplates } from '~/controllers/manage/template/get';
import { controlAuthUpdateOrderTemplate, controlAuthUpdateTemplate } from '~/controllers/manage/template/update';
import { controlAuthDestroyOrderTemplate, controlAuthDestroyTemplate } from '~/controllers/manage/template/destroy';

import { validatorAuthCreateTemplate } from '~/validators/manage/template/create';
import { validatorAuthSearchKeyWord, validatorCheckPages, validatorMongoId } from '~/validators';
import { validatorAuthUpdateOrderTemplate, validatorAuthUpdateTemplate } from '~/validators/manage/template/update';

const router = express.Router();

// Template
router.get('/', validatorCheckPages, controlAuthGetTemplates);

router.delete('/destroy', validatorMongoId, controlAuthDestroyTemplate);

router.post('/create', validatorAuthCreateTemplate, controlAuthCreateTemplate);

router.put('/update', validatorMongoId, validatorAuthUpdateTemplate, controlAuthUpdateTemplate);

// Order Template
router.get('/orders', validatorCheckPages, controlAuthGetOrdersTemplates);

router.delete('/orders/destroy', validatorMongoId, controlAuthDestroyOrderTemplate);

router.get('/orders/search', validatorAuthSearchKeyWord, controlAuthSearchOrderTemplate);

router.put('/orders/update', validatorMongoId, validatorAuthUpdateOrderTemplate, controlAuthUpdateOrderTemplate);

export default router;
