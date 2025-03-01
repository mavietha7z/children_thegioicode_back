import express from 'express';

import { controlAuthUpdateUser } from '~/controllers/manage/user/update';
import { controlAuthDestroyUser } from '~/controllers/manage/user/destroy';
import { controlAuthRegisterUser } from '~/controllers/manage/user/register';
import { controlAuthSearchUserByEmail } from '~/controllers/manage/user/search';
import { controlAuthGetHistoryLoginUsers } from '~/controllers/manage/user/history';
import { controlAuthSearchHistoryLoginUser } from '~/controllers/manage/user/searchHistory';
import { controlAuthGetUsers, controlAuthLogoutAllUsers, controlAuthLoginUser } from '~/controllers/manage/user/get';

import { validatorAuthUpdateUser } from '~/validators/manage/user/update';
import { validatorAuthRegisterUser } from '~/validators/manage/user/register';
import { validatorAuthSearchKeyWord, validatorCheckPages, validatorMongoId } from '~/validators';

const router = express.Router();

router.get('/logout-all', controlAuthLogoutAllUsers);

router.get('/', validatorCheckPages, controlAuthGetUsers);

router.get('/login', validatorMongoId, controlAuthLoginUser);

router.delete('/destroy', validatorMongoId, controlAuthDestroyUser);

router.post('/register', validatorAuthRegisterUser, controlAuthRegisterUser);

router.get('/search', validatorAuthSearchKeyWord, controlAuthSearchUserByEmail);

router.get('/login-histories', validatorCheckPages, controlAuthGetHistoryLoginUsers);

router.put('/update', validatorMongoId, validatorAuthUpdateUser, controlAuthUpdateUser);

router.get('/login-histories/search', validatorAuthSearchKeyWord, controlAuthSearchHistoryLoginUser);

export default router;
