import { User } from '~/models/user';
import { Wallet } from '~/models/wallet';
import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';

const controlV2GetAccountProfile = async (req, res) => {
    try {
        const { authorization } = req.headers;

        // Kiểm tra token
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'error_require_token' });
        }

        const token = authorization.split(' ')[1];

        const partner = await Partner.findOne({ token });
        if (!partner) {
            return res.status(401).json({ status: 401, error: 'Token của bạn không chính xác' });
        }

        const user = await User.findById(partner.user_id).select('id email full_name username status');
        if (user.status !== 'activated') {
            return res.status(403).json({ status: 403, error: 'Tài khoản của bạn đã bị khoá' });
        }

        const wallet = await Wallet.findOne({ user_id: user._id, status: 'activated' }).select('total_balance');
        if (!wallet) {
            return res.status(404).json({
                error: 'Không ví của bạn đã bị khoá',
            });
        }

        const data = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            balance: wallet.total_balance,
        };

        res.status(200).json({
            data,
            status: 200,
            message: 'Lấy thông tin tài khoản thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/profile.log', 'controlV2GetAccountProfile', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};
export { controlV2GetAccountProfile };
