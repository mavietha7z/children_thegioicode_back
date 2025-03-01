import speakeasy from 'speakeasy';
import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceUserSendOtpVerifyEmail, serviceUserVerifyToken } from '~/services/user/token';

const controlUserEnable2Fa = async (req, res) => {
    try {
        const { id, email } = req.user;
        const { two_factor_auth_type } = req.body;

        const user = await User.findById(id).select('two_factor_auth email');

        let data = null;
        let twoFactorAuth = {
            name: null,
            is_active: false,
            secret_code: null,
        };
        if (two_factor_auth_type === 'Google') {
            const secret = speakeasy.generateSecret({
                name: `Thegioicode:${email}`,
                issuer: 'Thegioicode',
            });

            twoFactorAuth = {
                name: two_factor_auth_type,
                is_active: false,
                secret_code: secret.base32,
            };

            data = secret.otpauth_url;
        }

        if (two_factor_auth_type === 'Email') {
            twoFactorAuth = {
                name: two_factor_auth_type,
                is_active: false,
                secret_code: null,
            };

            const isSendMail = await serviceUserSendOtpVerifyEmail(id, 'verify');
            if (!isSendMail) {
                return res.status(400).json({ error: 'Gửi mã xác minh không thành công' });
            }

            data = true;
        }

        user.updated_at = Date.now();
        user.two_factor_auth = twoFactorAuth;
        await user.save();

        res.status(200).json({
            data,
            status: 200,
            message: 'Bạn đã bật xác thực hai yếu tố Thegioicode',
        });
    } catch (error) {
        configCreateLog('controllers/my/account/2fa.log', 'controlUserEnable2Fa', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserVerify2Fa = async (req, res) => {
    try {
        const { otp, two_factor_auth_type } = req.body;

        const user = await User.findById(req.user.id).select('two_factor_auth');

        if (two_factor_auth_type === 'Google') {
            const verified = speakeasy.totp.verify({
                secret: user.two_factor_auth.secret_code,
                encoding: 'base32',
                token: otp,
                window: 1,
            });

            if (!verified) {
                return res.status(400).json({ error: 'Mã xác thực không đúng hoặc đã hết hạn' });
            }
        }
        if (two_factor_auth_type === 'Email') {
            const token = await serviceUserVerifyToken(otp, 'verify', true);

            if (!token) {
                return res.status(400).json({ error: 'Mã xác thực không đúng hoặc đã hết hạn' });
            }
        }

        user.two_factor_auth.is_active = true;
        await user.save();

        res.status(200).json({
            status: 200,
            message: `Kích hoạt xác thực hai yếu tố với ${two_factor_auth_type} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/my/account/2fa.log', 'controlUserVerify2Fa', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserTurnoff2Fa = async (req, res) => {
    try {
        const { two_factor_auth_type, otp } = req.body;

        const user = await User.findById(req.user.id).select('two_factor_auth');

        if (two_factor_auth_type === 'Email') {
            const token = await serviceUserVerifyToken(otp, 'verify', true);

            if (!token) {
                return res.status(400).json({ error: 'Mã xác thực không đúng hoặc đã hết hạn' });
            }
        }

        if (two_factor_auth_type === 'Google') {
            const verified = speakeasy.totp.verify({
                secret: user.two_factor_auth.secret_code,
                encoding: 'base32',
                token: otp,
                window: 1,
            });

            if (!verified) {
                return res.status(400).json({ error: 'Mã xác thực không đúng hoặc đã hết hạn' });
            }
        }

        user.two_factor_auth.name = null;
        user.two_factor_auth.is_active = false;
        user.two_factor_auth.secret_code = null;
        await user.save();

        res.status(200).json({
            status: 200,
            message: `Đã tắt xác thực hai yếu tố ${two_factor_auth_type} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/my/account/2fa.log', 'controlUserTurnoff2Fa', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserEnable2Fa, controlUserVerify2Fa, controlUserTurnoff2Fa };
