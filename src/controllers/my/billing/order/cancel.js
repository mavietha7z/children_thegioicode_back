import { Order } from '~/models/order';
import { Invoice } from '~/models/invoice';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';

const controlUserCanceledOrder = async (req, res) => {
    try {
        const { order_id } = req.params;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const order = await Order.findOne({ id: order_id, status: { $in: ['completed', 'pending'] } });
        if (!order) {
            return res.status(404).json({
                error: `Đơn hàng #${order_id} không tồn tại`,
            });
        }
        if (order.status === 'completed') {
            return res.status(400).json({
                error: 'Đơn hàng đã hoàn thành không thể hủy',
            });
        }

        const invoice = await Invoice.findOne({ id: order.invoice_id });
        if (!invoice) {
            return res.status(404).json({
                error: 'Hóa đơn của đơn hàng không tồn tại',
            });
        }

        order.status = 'canceled';
        invoice.status = 'canceled';
        order.updated_at = Date.now();
        invoice.updated_at = Date.now();

        await order.save();
        await invoice.save();

        res.status(200).json({
            status: 200,
            data: order_id,
            message: `Huỷ đơn hàng #${order_id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/order/cancel.log', 'controlUserCanceledOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserCanceledOrder };
