import moment from 'moment-timezone';
import { Order } from '~/models/order';
import { Invoice } from '~/models/invoice';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';
import { sendMessageBotTelegramApp, sendMessageBotTelegramError } from '~/bot';

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

                    // Bot telegram với múi giờ chuẩn
                    sendMessageBotTelegramApp(`Huỷ đơn hàng #${order.id} vì quá 7 ngày chưa thanh toán`);
                } catch (innerError) {
                    sendMessageBotTelegramError(`Lỗi cron cập nhật đơn hàng #${order.id}: \n ${innerError.message}`);
                    configCreateLog('services/cron/order.log', 'updateOrder', innerError.message);
                }
            }),
        );
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi cron order: \n ${error.message}`);
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

        // Bot telegram với múi giờ chuẩn
        sendMessageBotTelegramApp(`Xoá #${result.deletedCount} đơn trong giỏ hàng vì quá 7 ngày chưa thanh toán`);
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi cron xoá giỏ hàng: \n ${error.message}`);
        configCreateLog('services/cron/order.log', 'serviceCronRemoveOrderFromCart', error.message);
    }
};

export { serviceCronUnpaidOrder, serviceCronRemoveOrderFromCart };
