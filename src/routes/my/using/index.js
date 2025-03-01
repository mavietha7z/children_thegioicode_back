import express from 'express';

import { controlUserUsingGetOrderTemplates } from '~/controllers/my/using/template';
import { controlUserUsingGetOrderInstances } from '~/controllers/my/using/instances';

const router = express.Router();

router.get('/templates', controlUserUsingGetOrderTemplates);

router.get('/instances', controlUserUsingGetOrderInstances);

export default router;
