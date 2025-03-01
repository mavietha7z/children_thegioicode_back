import { Token } from '~/models/token';
import { configCreateLog } from '~/configs';

const controlUserLogout = async (req, res) => {
    try {
        const { session_key } = req.cookies;

        const token = await Token.findOne({ user_id: req.user.id, modun: 'login', token: session_key });
        if (token) {
            await token.deleteOne();
        }

        res.status(200).clearCookie('session_key').json({
            status: 200,
            message: 'Đăng xuất tài khoản thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/auth/logout.log', 'controlUserLogout', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserLogout };
