import { Order } from '~/models/order';
import { configCreateLog } from '~/configs';

const controlAuthGetOrders = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Order.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const orders = await Order.find({})
            .populate({
                path: 'user_id',
                select: 'id full_name email',
            })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = orders.map((order) => {
            const {
                id,
                status,
                discount,
                _id: key,
                products,
                coupon_id,
                invoice_id,
                created_at,
                updated_at,
                pay_method,
                bonus_point,
                total_price,
                description,
                total_payment,
                user_id: user,
            } = order;

            return {
                id,
                key,
                user,
                status,
                products,
                discount,
                coupon_id,
                invoice_id,
                created_at,
                pay_method,
                updated_at,
                bonus_point,
                total_price,
                description,
                total_payment,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/order/get.log', 'controlAuthGetOrders', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetOrders };
