import bcrypt from 'bcrypt';

import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceUserGetIPAddress } from '~/services/user/address';
import { serviceGetCurrentUser } from '~/services/user/currentUser';
import { serviceCreateLoginHistoryUser } from '~/services/user/loginHistory';
import { generateAccessTokenAuth, serviceUserCreateToken } from '~/services/user/token';

const controlAuthLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

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

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(400).json({
                error: 'Mật khẩu của bạn không chính xác',
            });
        }

        if (user.two_factor_auth.is_active) {
            return res.status(400).json({
                status: 2,
                error: 'Vui lòng xác minh đăng nhập bằng OTP',
                data: user.two_factor_auth.name,
            });
        }

        // Tạo lịch sử đăng nhập
        const ip = serviceUserGetIPAddress(req);
        await serviceCreateLoginHistoryUser(user._id, ip, req);

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
                data,
                status: 200,
                message: 'Đăng nhập tài khoản thành công',
            });
    } catch (error) {
        configCreateLog('controllers/manage/auth/login.log', 'controlAuthLogin', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthLogin };
