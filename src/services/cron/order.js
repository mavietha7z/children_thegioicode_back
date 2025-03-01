import moment from 'moment-timezone';
import { Order } from '~/models/order';
import { Invoice } from '~/models/invoice';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';

// Hủy đơn hàng
const serviceCronUnpaidOrder = async () => {
    try {
        const thresholdDate = moment.tz('Asia/Ho_Chi_Minh').subtract(7, 'days').toDate();
        const orders = await Order.find({ status: 'pending', created_at: { $lt: thresholdDate } }).sort({ created_at: -1 });

        if (orders.length < 1) {
            return;
        }

        await Promise.all(
            orders.map(async (order) => {
                try {
                    // Cập nhật hóa đơn
                    await Invoice.findOneAndUpdate({ id: order.invoice_id }, { status: 'canceled' });

                    // Cập nhật trạng thái đơn hàng
                    order.status = 'canceled';
                    await order.save();
                } catch (innerError) {
                    configCreateLog('services/cron/order.log', 'updateOrder', innerError.message);
                }
            }),
        );
    } catch (error) {
        configCreateLog('services/cron/order.log', 'serviceCronUnpaidOrder', error.message);
    }
};

// Xoá giỏ hàng
const serviceCronRemoveOrderFromCart = async () => {
    try {
        const thresholdDate = moment.tz('Asia/Ho_Chi_Minh').subtract(7, 'days').toDate();

        const result = await CartProduct.deleteMany({ created_at: { $lt: thresholdDate } });
        if (result.deletedCount < 1) {
            return;
        }
    } catch (error) {
        configCreateLog('services/cron/order.log', 'serviceCronRemoveOrderFromCart', error.message);
    }
};

export { serviceCronUnpaidOrder, serviceCronRemoveOrderFromCart };
