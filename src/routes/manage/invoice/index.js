import express from 'express';

import { controlAuthGetInvoices } from '~/controllers/manage/invoice/get';
import { controlAuthDestroyInvoice } from '~/controllers/manage/invoice/destroy';

import { validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetInvoices);

router.delete('/destroy', validatorMongoId, controlAuthDestroyInvoice);

export default router;
