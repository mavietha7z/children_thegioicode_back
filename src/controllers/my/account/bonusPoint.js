import { Wallet } from '~/models/wallet';
import { BonusPoint } from '~/models/bonusPoint';
import { configCreateLog, convertCurrency } from '~/configs';
import { serviceCreateWalletHistoryUser } from '~/services/user/walletHistory';

const controlUserGetBonusPoints = async (req, res) => {
    try {
        const { type } = req.query;

        if (!['all', 'income', 'exchange'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        let objectQuery = { user_id: req.user.id };
        if (type === 'income') {
            objectQuery.bonus_type = 'income';
        } else if (type === 'exchange') {
            objectQuery.bonus_type = 'exchange';
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await BonusPoint.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const results = await BonusPoint.find(objectQuery)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((point) => {
            return {
                id: point.id,
                bonus_point: point.bonus_point,
                bonus_type: point.bonus_type,
                reason: point.reason,
                status: point.status,
                created_at: point.created_at,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/account/bonusPoint.log', 'controlUserGetBonusPoints', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserExchangeBonusPoint = async (req, res) => {
    try {
        const { type, bonus_point } = req.body;

        if (!['all', 'point'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const wallet = await Wallet.findOne({ user_id: req.user.id, status: 'activated' });
        if (!wallet) {
            return res.status(404).json({ error: 'Ví không tồn tại hoặc đã bị khoá' });
        }
        if (wallet.bonus_point === 0) {
            return res.status(400).json({ error: 'Ví của bạn đã hết điểm thưởng' });
        }

        const before = wallet.total_balance;
        let after = wallet.total_balance;
        let amount = after - before;

        if (type === 'point') {
            if (!bonus_point || typeof bonus_point !== 'number' || bonus_point < 100) {
                return res.status(400).json({ error: 'Số điểm phải lớn hơn hoặc bằng 100 điểm' });
            }

            after = wallet.total_balance + bonus_point;
            amount = bonus_point;
        }
        if (type === 'all') {
            after = wallet.total_balance + wallet.bonus_point;
            amount = wallet.bonus_point;
        }

        const walletHistory = {
            type: 'deposit',
            before,
            amount,
            after,
            service: 'Service\\BonusPoint\\Exchange',
            description: `Đổi ${convertCurrency(amount).slice(0, -1)} điểm thưởng thành tiền khuyến mãi`,
        };
        const bonusHistory = {
            bonus_point: -amount,
            bonus_type: 'exchange',
            reason: `Đổi ${convertCurrency(amount).slice(0, -1)} điểm thưởng thành tiền khuyến mãi`,
        };
        const isWalletHistory = await serviceCreateWalletHistoryUser(req.user.id, walletHistory, bonusHistory);
        if (!isWalletHistory) {
            return res.status(400).json({
                error: 'Lỗi thanh toán hoá đơn',
            });
        }

        if (wallet.bonus_point === amount) {
            wallet.bonus_point_expiry = null;
            await wallet.save();
        }

        res.status(200).json({
            status: 200,
            message: `Đổi ${convertCurrency(amount).slice(0, -1)} điểm sang tiền khuyến mãi thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/my/account/bonusPoint.log', 'controlUserExchangeBonusPoint', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetBonusPoints, controlUserExchangeBonusPoint };
