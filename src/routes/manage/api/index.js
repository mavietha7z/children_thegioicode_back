import express from 'express';

import { controlAuthGetApis } from '~/controllers/manage/api/get';
import { controlAuthUpdateApi } from '~/controllers/manage/api/update';
import { controlAuthCreateApi } from '~/controllers/manage/api/create';
import { controlAuthDestroyApi } from '~/controllers/manage/api/destroy';
import { controlGetApisRequests } from '~/controllers/manage/api/request';
import { controlExportsPlayers, controlGetApisPlayers } from '~/controllers/manage/api/player';
import { controlAuthGetDocumentApi, controlAuthUpdateDocumentApi } from '~/controllers/manage/api/document';

import { validatorCheckPages, validatorMongoId } from '~/validators';
import { validatorAuthCreateApi } from '~/validators/manage/api/create';
import { validatorAuthUpdateApi } from '~/validators/manage/api/update';

const router = express.Router();

router.get('/document', controlAuthGetDocumentApi);

router.put('/document', controlAuthUpdateDocumentApi);

router.get('/players/exports', controlExportsPlayers);

router.get('/', validatorCheckPages, controlAuthGetApis);

router.delete('/destroy', validatorMongoId, controlAuthDestroyApi);

router.get('/players', validatorCheckPages, controlGetApisPlayers);

router.get('/requests', validatorCheckPages, controlGetApisRequests);

router.post('/create', validatorAuthCreateApi, controlAuthCreateApi);

router.put('/update', validatorMongoId, validatorAuthUpdateApi, controlAuthUpdateApi);

export default router;
