import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';

import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceGetCurrentUser } from '~/services/user/currentUser';
import { generateAccessTokenAuth, serviceUserCreateToken } from '~/services/user/token';

const controlAuthVerifyLoginEmail = async (req, res) => {
    try {
        const { email, password, otp, type } = req.body;

        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                error: 'Mã xác minh không hợp lệ',
            });
        }
        if (!['Google', 'Email'].includes(type)) {
            return res.status(400).json({ error: 'Loại xác minh không hợp lệ' });
        }

        const user = await User.findOne({ email, admin: true, role: { $in: ['admin'] } })
            .populate({
                path: 'membership.current',
                select: 'name description',
            })
            .populate({
                path: 'membership.next_membership',
                select: 'name achieve_point description',
            });

        if (!user) {
            return res.status(404).json({
                error: 'Tài khoản của bạn không tồn tại',
            });
        }
        if (user.status === 'inactivated') {
            return res.status(400).json({
                error: 'Tài khoản của bạn không hoạt động',
            });
        }
        if (user.status === 'blocked') {
            return res.status(400).json({
                error: 'Tài khoản của bạn đã bị khóa',
            });
        }
        if (user.register_type !== 'email') {
            return res.status(400).json({
                error: `Vui lòng đăng nhập email này với ${user.register_type}`,
            });
        }

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(400).json({
                error: 'Mật khẩu của bạn không chính xác',
            });
        }
        if (!user.email_verified) {
            return res.status(400).json({
                status: 1,
                error: 'Vui lòng xác minh email của bạn',
            });
        }

        const verified = speakeasy.totp.verify({
            secret: user.two_factor_auth.secret_code,
            encoding: 'base32',
            token: otp,
            window: 1,
        });

        if (!verified) {
            return res.status(400).json({ error: 'Mã xác thực không đúng hoặc đã hết hạn' });
        }

        user.last_login_at = Date.now();
        await user.save();

        const data = await serviceGetCurrentUser(user);

        // Lấy token để trả về
        const accessToken = generateAccessTokenAuth(user);
        const created_at = new Date();
        const expired_at = new Date(created_at.getTime() + 1 * 60 * 60 * 1000);
        await serviceUserCreateToken(user._id, 'login', null, 'jsonwebtoken', accessToken, created_at, expired_at);

        res.status(200)
            .cookie('authen_key', accessToken, {
                httpOnly: true,
                secure: true,
                path: '/',
                sameSite: 'strict',
                domain: req.hostUrl,
            })
            .json({
                status: 200,
                message: 'Đăng nhập tài khoản thành công',
                data,
            });
    } catch (error) {
        configCreateLog('controllers/manage/auth/verifyLogin.log', 'controlAuthVerifyLoginEmail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthVerifyLoginEmail };
