import bcrypt from 'bcrypt';
import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceUserVerifyToken } from '~/services/user/token';

const regexPassword = /^\S{6,30}$/;
const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const controlUserVerifyOtpPassword = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!regexEmail.test(email)) {
            return res.status(400).json({ error: 'Email không đúng định dạng' });
        }

        const user = await User.findOne({ email }).select('id email full_name');
        if (!user) {
            return res.status(404).json({
                error: 'Tài khoản liên kết email này không tồn tại',
            });
        }

        const token = await serviceUserVerifyToken(otp, 'reset', false);
        if (!token) {
            return res.status(400).json({ error: 'Mã xác thực không đúng hoặc đã hết hạn' });
        }

        res.status(200).json({
            status: 200,
            message: 'OTP xác minh email chính xác',
        });
    } catch (error) {
        configCreateLog('controllers/my/auth/password.log', 'controlUserVerifyOtpPassword', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserConfirmResetPassword = async (req, res) => {
    try {
        const { email, otp, new_password, renew_password } = req.body;

        if (!regexEmail.test(email)) {
            return res.status(400).json({ error: 'Email không đúng định dạng' });
        }
        if (otp.length !== 6) {
            return res.status(400).json({ error: 'Mã xác minh không hợp lệ' });
        }

        if (!regexPassword.test(new_password) || !regexPassword.test(renew_password)) {
            return res.status(400).json({
                error: 'Mật khẩu mới không hợp lệ',
            });
        }
        if (new_password !== renew_password) {
            return res.status(400).json({
                error: 'Mật khẩu mới và nhập lại không trùng khớp',
            });
        }

        const currentToken = await serviceUserVerifyToken(otp, 'reset', false);
        if (!currentToken) {
            return res.status(400).json({
                error: 'Mã xác minh không hợp lệ hoặc đã hết hạn',
            });
        }

        const user = await User.findById(currentToken.user_id._id);
        if (!user) {
            return res.status(404).json({
                error: 'Tài khoản liên kết token này không tồn tại',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(new_password, salt);

        user.password = hashed;
        await user.save();

        await currentToken.deleteOne();

        res.status(200).json({
            status: 200,
            message: 'Khôi phục mật khẩu mới thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/auth/password.log', 'controlUserConfirmResetPassword', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserVerifyOtpPassword, controlUserConfirmResetPassword };
