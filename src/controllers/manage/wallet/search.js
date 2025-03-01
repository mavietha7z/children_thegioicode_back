import { User } from '~/models/user';
import { Wallet } from '~/models/wallet';
import { configCreateLog } from '~/configs';
import { serviceAuthGetWallets } from '~/services/manage/wallet/get';

const controlAuthSearchWalletByEmail = async (req, res) => {
    try {
        const { keyword } = req.query;

        const users = await User.find({ email: { $regex: keyword, $options: 'i' } });
        const userIds = users.map((user) => user._id);

        const wallets = await Wallet.find({ user_id: { $in: userIds } }).populate({ path: 'user_id', select: 'id full_name email' });
        const data = serviceAuthGetWallets(wallets);

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/wallet/search.log', 'controlAuthSearchWalletByEmail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthSearchWalletByEmail };
