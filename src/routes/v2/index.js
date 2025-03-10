import express from 'express';
import { middlewareVerifyApiKey } from '~/middleware/v2';

import { controlV2GetInfoApiKeys } from '~/controllers/v2/apikey';
import { controlV2LoginFreeFire } from '~/controllers/v2/freefire';
import { controlV2LoginVngGames } from '~/controllers/v2/vnggames';
import { controlV2CheckGarenaLogin } from '~/controllers/v2/garena';

import { validateV2Garena } from '~/validators/v2/garena';
import { validateV2FreeFire } from '~/validators/v2/freefire';
import { validateV2VngGames } from '~/validators/v2/vnggames';

const router = express.Router();

router.get('/apikey', controlV2GetInfoApiKeys);

router.post('/garena_login', validateV2Garena, middlewareVerifyApiKey, controlV2CheckGarenaLogin);

router.post('/vnggames_login', validateV2VngGames, middlewareVerifyApiKey, controlV2LoginVngGames);

router.post('/player_id_login', validateV2FreeFire, middlewareVerifyApiKey, controlV2LoginFreeFire);

export default router;
