import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceUserSendOtpVerifyEmail } from '~/services/user/token';

const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const controlUserSendCodeVerifyEmail = async (req, res) => {
    try {
        const { email, module } = req.body;

        if (!regexEmail.test(email)) {
            return res.status(400).json({ error: 'Địa chỉ email không hợp lệ' });
        }
        if (!module) {
            return res.status(400).json({ error: 'Vui lòng chọn module xác minh' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Tài khoản cần xác minh không tồn tại' });
        }

        const result = await serviceUserSendOtpVerifyEmail(user._id, module);
        if (!result) {
            return res.status(400).json({ error: 'Gửi mã xác minh tài khoản thất bại' });
        }

        res.status(200).json({
            status: 200,
            message: 'Gửi mã xác minh tài khoản thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/auth/sendCode.log', 'controlUserSendCodeVerifyEmail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserSendCodeVerifyEmail };
