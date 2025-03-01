import { Token } from '~/models/token';
import { configCreateLog } from '~/configs';

const controlAuthLogout = async (req, res) => {
    try {
        const { authen_key } = req.cookies;

        const token = await Token.findOne({ user_id: req.user.id, modun: 'login', token: authen_key });
        if (token) {
            await token.deleteOne();
        }

        res.status(200).clearCookie('authen_key').json({
            status: 200,
            message: 'Đăng xuất tài khoản thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/auth/logout.log', 'controlAuthLogout', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthLogout };
