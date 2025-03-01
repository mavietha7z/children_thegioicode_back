import { configCreateLog } from '~/configs';
import { BonusPoint } from '~/models/bonusPoint';

const controlAuthGetBonusPoints = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await BonusPoint.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const results = await BonusPoint.find({})
            .populate({ path: 'user_id', select: 'id full_name email' })
            .populate({ path: 'wallet_id', select: 'id total_balance bonus_point' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                reason,
                status,
                _id: key,
                created_at,
                updated_at,
                bonus_type,
                bonus_point,
                user_id: user,
                wallet_id: wallet,
            } = result;

            return {
                id,
                key,
                user,
                wallet,
                reason,
                status,
                created_at,
                updated_at,
                bonus_type,
                bonus_point,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/bonusPoint/get.log', 'controlAuthGetBonusPoints', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetBonusPoints };
