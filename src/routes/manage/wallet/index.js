import express from 'express';

import { controlAuthUpdateWalletUser } from '~/controllers/manage/wallet/update';
import { controlAuthSearchWalletByEmail } from '~/controllers/manage/wallet/search';
import { controlAuthDestroyWalletHistory } from '~/controllers/manage/wallet/destroy';
import { controlAuthGetWalletHistories, controlAuthGetWallets } from '~/controllers/manage/wallet/get';

import { validatorAuthSearchKeyWord, validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/', validatorCheckPages, controlAuthGetWallets);

router.put('/update', validatorMongoId, controlAuthUpdateWalletUser);

router.get('/histories', validatorCheckPages, controlAuthGetWalletHistories);

router.get('/search', validatorAuthSearchKeyWord, controlAuthSearchWalletByEmail);

router.delete('/histories/destroy', validatorMongoId, controlAuthDestroyWalletHistory);

export default router;
