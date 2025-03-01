import { Order } from '~/models/order';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';

const controlUserGetOrders = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Order.countDocuments({ user_id: req.user.id, status: { $in: ['completed', 'pending'] } });
        const pages = Math.ceil(count / pageSize);

        const orders = await Order.find({ user_id: req.user.id, status: { $in: ['completed', 'pending'] } })
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
                total_price: order.total_price,
                total_payment: order.total_payment,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/order/get.log', 'controlUserGetOrders', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserGetOrderDetail = async (req, res) => {
    try {
        const { order_id } = req.params;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const order = await Order.findOne({ user_id: req.user.id, id: order_id, status: { $in: ['completed', 'pending'] } });
        if (!order) {
            return res.status(404).json({
                error: `Đơn hàng #${order_id} không tồn tại`,
            });
        }

        const data = {
            id: order.id,
            status: order.status,
            paid_at: order.paid_at,
            coupons: order.coupons,
            invoice_id: order.invoice_id,
            created_at: order.created_at,
            pay_method: order.pay_method,
            description: order.description,
            total_price: order.total_price,
            bonus_point: order.bonus_point,
            total_payment: order.total_payment,
            products: order.products.map((product) => {
                const { data_url, cycles, discount, module, quantity, title, description, total_price, unit_price, ...others } = product;

                return {
                    title,
                    cycles,
                    module,
                    discount,
                    quantity,
                    unit_price,
                    total_price,
                    description,
                    data_url: order.status === 'completed' ? data_url : null,
                };
            }),
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/order/get.log', 'controlUserGetOrderDetail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetOrders, controlUserGetOrderDetail };
