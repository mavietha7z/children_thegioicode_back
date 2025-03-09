import { configCreateLog } from '~/configs';
import { OrderSource } from '~/models/orderSource';

const controlUserBillingGetSources = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await OrderSource.countDocuments({ user_id: req.user.id, status: { $in: ['completed', 'pending'] } });
        const pages = Math.ceil(count / pageSize);

        const orders = await OrderSource.find({ user_id: req.user.id, status: { $in: ['completed', 'pending'] } })
            .populate({ path: 'source_id', select: '-_id id title slug_url' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const startIndex = (req.page - 1) * pageSize + 1;

        const data = orders.map((order, index) => {
            return {
                id: order.id,
                status: order.status,
                index: startIndex + index,
                invoice_id: order.invoice_id,
                created_at: order.created_at,
                source: order.source_id,
                unit_price: order.unit_price,
                quantity: order.quantity,
                cycles: order.cycles,
                discount: order.discount,
                total_price: order.total_price,
                data_url: order.data_url,
                bonus_point: order.bonus_point,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/source/get.log', 'controlUserBillingGetSources', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserBillingGetSources };
