import multer from 'multer';
import express from 'express';

const upload = multer({ dest: 'src/files' });

import { controlAuthExportDatabase } from '~/controllers/manage/database/export';
import { controlAuthImportDatabase } from '~/controllers/manage/database/import';

import { validatorAuthExportDatabase } from '~/validators/manage/database/export';

const router = express.Router();

router.post('/import', upload.single('file'), controlAuthImportDatabase);

router.post('/export', validatorAuthExportDatabase, controlAuthExportDatabase);

export default router;
