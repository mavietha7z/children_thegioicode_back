import { Order } from '~/models/order';
import { Wallet } from '~/models/wallet';
import { Invoice } from '~/models/invoice';
import { convertCurrency } from '~/configs';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { serviceCreateNotification } from '~/services/user/notification';
import { serviceUserPaymentOrderOrInvoice } from '~/services/user/payment';
import { serviceCreateWalletHistoryUser } from '~/services/user/walletHistory';

const controlUserPaymentOrder = async (req, res) => {
    try {
        const { order_id } = req.params;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const order = await Order.findOne({ id: order_id })
            .populate({
                path: 'products.product_id',
                select: 'id user_id template_id pricing_id invoice_id bonus_point total_price total_payment status updated_at expired_at',
            })
            .populate({
                path: 'products.pricing_id',
                select: 'id cycles_id price discount bonus_point status',
                populate: {
                    path: 'cycles_id',
                    select: 'id value unit display_name',
                },
            });
        if (!order) {
            return res.status(404).json({
                error: `Đơn hàng #${order_id} không tồn tại`,
            });
        }
        if (order.status === 'completed') {
            return res.status(400).json({
                error: `Đơn hàng #${order_id} đã được thanh toán`,
            });
        }
        if (order.status === 'canceled') {
            return res.status(400).json({
                error: 'Đơn hàng đã huỷ không thể thanh toán',
            });
        }

        const wallet = await Wallet.findOne({ user_id: req.user.id }).select('total_balance');
        if (Math.abs(order.total_payment) > wallet.total_balance) {
            return res.status(400).json({
                error: 'Số dư ví không đủ thanh toán đơn hàng này',
            });
        }

        const invoice = await Invoice.findOne({ id: order.invoice_id });
        if (!invoice) {
            return res.status(400).json({
                error: 'Hoá đơn của đơn hàng này không tồn tại',
            });
        }

        for (const product of order.products) {
            const result = await serviceUserPaymentOrderOrInvoice(product, order, invoice);
            if (!result.success) {
                return res.status(result.status).json({
                    error: result.error,
                });
            }
        }

        // Ghi lịch sử giao dịch
        const before = wallet.total_balance;
        const after = wallet.total_balance - Math.abs(order.total_payment);
        const amount = after - before;

        const walletHistory = {
            type: 'service',
            before,
            amount,
            after,
            service: 'Service\\Order\\Payment',
            description: `Thanh toán hoá đơn #${order.invoice_id}`,
        };
        const bonusHistory = {
            bonus_point: invoice.bonus_point,
            bonus_type: 'income',
            reason: {
                invoice_id: invoice.id,
                service: 'Service\\Order\\Payment',
            },
        };

        const isWalletHistory = await serviceCreateWalletHistoryUser(req.user.id, walletHistory, bonusHistory);
        if (!isWalletHistory) {
            return res.status(400).json({
                error: 'Lỗi thanh toán hoá đơn',
            });
        }

        order.status = 'completed';
        order.paid_at = Date.now();
        invoice.status = 'completed';
        order.updated_at = Date.now();
        invoice.updated_at = Date.now();
        invoice.processed_at = Date.now();

        await order.save();
        await invoice.save();

        // Tạo thông web
        await serviceCreateNotification(
            req.user.id,
            'Web',
            `Hoá đơn mã #${invoice.id} đã được xuất`,
            `Kính chào quý khách ${req.user.full_name}. Hoá đơn sử dụng dịch vụ số #${invoice.id} với tổng số tiền ${convertCurrency(
                Math.abs(invoice.total_payment),
            )} đã được thanh toán thành công. Xem thêm thông tin tại: https://netcode.vn/billing/invoices/${invoice.id}. Trân trọng!`,
        );

        const data = {
            id: order.id,
            status: order.status,
            paid_at: order.paid_at,
            coupons: order.coupons,
            invoice_id: order.invoice_id,
            created_at: order.created_at,
            pay_method: order.pay_method,
            bonus_point: order.bonus_point,
            total_price: order.total_price,
            description: order.description,
            total_payment: order.total_payment,
            products: order.products.map((product) => {
                const { data_url, cycles, discount, module, quantity, title, description, total_price, unit_price, ...others } = product;

                return {
                    title,
                    cycles,
                    module,
                    quantity,
                    discount,
                    data_url,
                    unit_price,
                    total_price,
                    description,
                };
            }),
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Thanh toán đơn hàng #${order_id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/order.log', 'controlUserPaymentOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserPaymentOrder };
