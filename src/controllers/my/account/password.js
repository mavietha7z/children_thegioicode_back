import bcrypt from 'bcrypt';
import { User } from '~/models/user';
import { configCreateLog } from '~/configs';

const controlUserChangePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        const user = await User.findById(req.user.id).select('password');

        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'Thay đổi mật khẩu thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/account/password.log', 'controlUserChangePassword', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserVerifyPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6 || password.length > 20) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const user = await User.findById(req.user.id);

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(400).json({
                error: 'Mật khẩu của bạn không chính xác',
            });
        }

        res.status(200).json({
            data: true,
            status: 200,
            message: 'Xác thực mật khẩu người dùng thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/account/password.log', 'controlUserVerifyPassword', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserChangePassword, controlUserVerifyPassword };
