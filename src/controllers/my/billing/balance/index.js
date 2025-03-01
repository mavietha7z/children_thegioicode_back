import { configCreateLog } from '~/configs';
import { WalletHistory } from '~/models/walletHistory';

const controlUserGetWalletHistory = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await WalletHistory.countDocuments({ user_id: req.user.id });
        const pages = Math.ceil(count / pageSize);

        const results = await WalletHistory.find({ user_id: req.user.id })
            .select('id type service before amount after description created_at')
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const startIndex = (req.page - 1) * pageSize + 1;

        const data = results.map((result, index) => {
            return {
                id: result.id,
                type: result.type,
                after: result.after,
                before: result.before,
                amount: result.amount,
                service: result.service,
                index: startIndex + index,
                created_at: result.created_at,
                description: result.description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/balance/index.log', 'controlUserGetWalletHistory', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetWalletHistory };
