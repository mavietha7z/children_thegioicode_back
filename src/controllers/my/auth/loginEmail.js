import bcrypt from 'bcrypt';
import moment from 'moment';

import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceUserGetIPAddress } from '~/services/user/address';
import { serviceGetCurrentUser } from '~/services/user/currentUser';
import { serviceCreateNotificationUser } from '~/services/user/notification';
import { serviceCreateLoginHistoryUser } from '~/services/user/loginHistory';
import { generateAccessTokenUser, serviceUserCreateToken, serviceUserSendOtpVerifyEmail } from '~/services/user/token';

const controlUserLoginByEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, role: { $in: ['user'] } })
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
        if (user.status === 'inactivated' && user.email_verified) {
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

        if (user.two_factor_auth.is_active) {
            if (user.two_factor_auth.name === 'Email') {
                const isSendMail = await serviceUserSendOtpVerifyEmail(user._id, 'verify');
                if (!isSendMail) {
                    return res.status(400).json({ error: 'Gửi mã xác minh không thành công' });
                }
            }

            return res.status(400).json({
                status: 2,
                error: 'Vui lòng xác minh đăng nhập bằng OTP',
                data: user.two_factor_auth.name,
            });
        }

        if (user.role.length === 1 && user.role.includes('user')) {
            // Tạo lịch sử đăng nhập
            const ip = serviceUserGetIPAddress(req);
            await serviceCreateLoginHistoryUser(user._id, ip, req);

            // Tạo thông báo đăng nhập mới
            await serviceCreateNotificationUser(
                user._id,
                'Web',
                'Quý khách đăng nhập từ thiết bị mới?',
                `Kính chào quý khách ${
                    user.full_name
                }. Tài khoản của quý khách vừa được truy cập từ thiết bị mới, chi tiết như sau: Địa chỉ IPV4/V6: ${ip} Thiết bị: ${
                    req.device.os.name
                } ${req.device.os.version} Tên thiết bị trình duyệt: ${req.device.client.name} ${
                    req.device.client.version
                } Thời gian: ${moment(new Date()).format(
                    'DD/MM/YYYY HH:mm:ss',
                )}. Nếu truy cập trên đúng là từ quý khách, vui lòng bỏ qua thông báo này. Ngược lại, Thegioicode đề nghị quý khách đăng nhập lại và thực hiện đổi mật khẩu. Trân trọng!`,
            );
        }

        user.last_login_at = Date.now();
        await user.save();

        const data = await serviceGetCurrentUser(user);

        // Lấy token để trả về
        const accessToken = generateAccessTokenUser(user);
        const created_at = new Date();
        const expired_at = new Date(created_at.getTime() + 2 * 60 * 60 * 1000);
        await serviceUserCreateToken(user._id, 'login', null, 'jsonwebtoken', accessToken, created_at, expired_at);

        res.status(200)
            .cookie('session_key', accessToken, {
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
        configCreateLog('controllers/my/auth/loginEmail.log', 'controlUserLoginByEmail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserLoginByEmail };
