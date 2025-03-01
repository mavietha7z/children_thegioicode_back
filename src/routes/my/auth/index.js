import express from 'express';
import middleware from '~/middleware';

import { controlUserLogout } from '~/controllers/my/auth/logout';
import { controlUserGetCurrent } from '~/controllers/my/auth/currentUser';
import { controlUserLoginGoogle } from '~/controllers/my/auth/loginGoogle';
import { controlUserLoginByEmail } from '~/controllers/my/auth/loginEmail';
import { controlUserSendCodeVerifyEmail } from '~/controllers/my/auth/sendCode';
import { controlUserVerifyLoginEmail } from '~/controllers/my/auth/verifyLoginEmail';
import { controlUserConfirmResetPassword, controlUserVerifyOtpPassword } from '~/controllers/my/auth/password';
import { controlUserRegisterAccount, controlUserSendEmailVerifyRegister } from '~/controllers/my/auth/register';

import { validatorLogin } from '~/validators/auth/login';
import { validatorRegister } from '~/validators/auth/register';

const router = express.Router();

router.get('/current-user', controlUserGetCurrent);

router.post('/login-google', controlUserLoginGoogle);

router.post('/verify-otp', controlUserVerifyOtpPassword);

router.post('/confirm-reset', controlUserConfirmResetPassword);

router.post('/login', validatorLogin, controlUserLoginByEmail);

router.post('/logout', middleware.verifyUser, controlUserLogout);

router.post('/send-email-verify', controlUserSendCodeVerifyEmail);

router.post('/verify-login', validatorLogin, controlUserVerifyLoginEmail);

// Đăng ký tài khoản
router.post('/register', validatorRegister, controlUserRegisterAccount);

router.post('/send-email-register', controlUserSendEmailVerifyRegister);

export default router;
