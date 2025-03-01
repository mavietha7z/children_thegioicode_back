import { Api } from '~/models/api';
import { User } from '~/models/user';
import { Wallet } from '~/models/wallet';
import { Apikey } from '~/models/apikey';
import { configCreateLog, configGetDiscountRulePartner } from '~/configs';
import { serviceCreateWalletHistoryUser } from '~/services/user/walletHistory';

const middlewareVerifyApiKey = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'error_require_apikey',
        });
    }

    const apikey = authorization.split(' ')[1];

    try {
        const currentApikey = await Apikey.findOne({ key: apikey });
        if (!currentApikey) {
            return res.status(401).json({
                error: 'Apikey của bạn không chính xác',
            });
        }
        if (!currentApikey.status) {
            return res.status(400).json({
                error: 'Apikey của bạn đã bị khoá',
            });
        }

        const user = await User.findById(currentApikey.user_id).select('id email full_name status');
        if (!user) {
            return res.status(404).json({
                error: 'Tài khoản của bạn không tồn tại',
            });
        }
        if (user.status !== 'activated') {
            return res.status(400).json({
                error: 'Tài khoản của bạn đã bị khoá',
            });
        }

        const currentApi = await Api.findOne({ category: currentApikey.category }).select('title status price category datadome proxy');
        if (!currentApi) {
            return res.status(400).json({
                error: 'API cần truy vấn không tồn tại',
            });
        }
        if (currentApi.status === 'blocked') {
            return res.status(400).json({
                error: 'API cần truy vấn đã bị khoá',
            });
        }
        if (currentApi.status === 'maintenance') {
            return res.status(400).json({
                error: 'API cần truy vấn đang bảo trì',
            });
        }

        const wallet = await Wallet.findOne({ user_id: user._id });
        if (currentApikey.free_usage === 0 && wallet.total_balance < currentApi.price) {
            return res.status(400).json({
                error: 'Số dư ví của bạn không đủ',
            });
        }

        // Thêm lịch sử giao dịch
        if (currentApikey.free_usage === 0 && currentApi.price > 0) {
            const before = wallet.total_balance;
            const after = wallet.total_balance - currentApi.price;
            const amount = after - before;

            const walletHistory = {
                type: 'service',
                before,
                amount,
                after,
                service: `Service\\Apis\\${currentApikey.category}`,
                description: `Thanh toán dịch vụ ${currentApi.title}`,
            };
            const bonusHistory = {
                bonus_point: 0,
                bonus_type: 'income',
                reason: {
                    invoice_id: '',
                    service: `Service\\Apis\\${currentApikey.category}`,
                },
            };

            const isWalletHistory = await serviceCreateWalletHistoryUser(user._id, walletHistory, bonusHistory);
            if (!isWalletHistory) {
                return res.status(400).json({
                    error: 'Lỗi thanh toán hoá đơn',
                });
            }
        }

        if (currentApikey.free_usage > 0) {
            currentApikey.free_usage -= 1;
        }
        currentApikey.use += 1;
        await currentApikey.save();

        req.user = user;
        req.currentApi = currentApi;
        req.apiProxy = currentApi.proxy;
        req.apiDatadome = currentApi.datadome;

        next();
    } catch (error) {
        configCreateLog('middleware/v2.log', 'middlewareVerifyApiKey', error.message);

        return res.status(500).json({
            error: 'Lỗi hệ thống vui lòng thử lại sau',
        });
    }
};

export { middlewareVerifyApiKey };
