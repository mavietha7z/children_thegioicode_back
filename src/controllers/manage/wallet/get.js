import { Wallet } from '~/models/wallet';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { WalletHistory } from '~/models/walletHistory';
import { serviceAuthGetWallets } from '~/services/manage/wallet/get';

const controlAuthGetWallets = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Wallet.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const wallets = await Wallet.find(objectQuery)
            .populate({ path: 'user_id', select: 'id full_name email' })
            .skip(skip)
            .limit(pageSize)
            .sort({ total_balance: -1 });

        const data = serviceAuthGetWallets(wallets);

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/wallet/get.log', 'controlAuthGetWallets', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthGetWalletHistories = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await WalletHistory.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const results = await WalletHistory.find({})
            .populate({ path: 'user_id', select: 'id full_name email' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const { _id: key, id, user_id: user, type, after, before, amount, service, created_at, description, updated_at } = result;

            return {
                id,
                key,
                user,
                type,
                after,
                before,
                amount,
                service,
                created_at,
                updated_at,
                description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/wallet/get.log', 'controlAuthGetWalletHistories', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetWallets, controlAuthGetWalletHistories };
