import express from 'express';

import { controlUserPaymentInvoice } from '~/controllers/my/billing/invoice/payment';
import { controlUserGetInvoiceDetail, controlUserGetInvoices } from '~/controllers/my/billing/invoice/get';

import { validatorCheckPages } from '~/validators';

const router = express.Router();

router.get('/:invoice_id', controlUserGetInvoiceDetail);

router.get('/', validatorCheckPages, controlUserGetInvoices);

router.post('/payment/:invoice_id', controlUserPaymentInvoice);

export default router;
