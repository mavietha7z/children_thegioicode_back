import express from 'express';
import middleware from '~/middleware';

import { controlUploadImage } from '~/controllers/upload/image';

const router = express.Router();

router.post('/image', middleware.verifyUserOrAuth, controlUploadImage);

export default router;
