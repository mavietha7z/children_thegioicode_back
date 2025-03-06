import express from 'express';

import { controlAuthGetApis } from '~/controllers/manage/api/get';
import { controlAuthUpdateApi } from '~/controllers/manage/api/update';
import { controlGetApisRequests } from '~/controllers/manage/api/request';
import { controlAuthAsyncPublicApi } from '~/controllers/manage/api/async';
import { controlExportsPlayers, controlGetApisPlayers } from '~/controllers/manage/api/player';

import { validatorCheckPages, validatorMongoId } from '~/validators';
import { validatorAuthUpdateApi } from '~/validators/manage/api/update';

const router = express.Router();

router.get('/async', controlAuthAsyncPublicApi);

router.get('/players/exports', controlExportsPlayers);

router.get('/', validatorCheckPages, controlAuthGetApis);

router.get('/players', validatorCheckPages, controlGetApisPlayers);

router.get('/requests', validatorCheckPages, controlGetApisRequests);

router.put('/update', validatorMongoId, validatorAuthUpdateApi, controlAuthUpdateApi);

export default router;
