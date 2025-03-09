import { User } from '~/models/user';
import { Wallet } from '~/models/wallet';
import { Paygate } from '~/models/paygate';
import { convertCurrency } from '~/configs';
import { configCreateLog } from '~/configs';
import { serviceCreateNotification } from '~/services/user/notification';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';

const controlRechargeBankTransferCallback = async (req, res) => {
    try {
        const { error, data } = req.body;

        const token = req.headers['secure-token'];
        if (!token) {
            return res.status(401).json({
                error: 'error_require_token',
            });
        }
        if (typeof error !== 'number' || error !== 0) {
            return res.status(400).json({
                error: `request_failed_status_${error || 400}`,
            });
        }
        if (!data[0]) {
            return res.status(400).json({
                error: 'Dữ liệu yêu cầu không hợp lệ',
            });
        }

        const { amount, description } = data[0];

        const paygate = await Paygate.findOne({ callback_code: 'bank_transfer', status: true })
            .select('name service callback_code discount bonus_point minimum_payment maximum_payment promotion status options')
            .populate({
                path: 'options.userbank_id',
                select: 'id user_id localbank_id account_number account_holder service',
                populate: [
                    { path: 'user_id', select: 'id email full_name' },
                    { path: 'localbank_id', select: 'id full_name sub_name code status interbank_code' },
                ],
            });
        if (!paygate) {
            return res.status(400).json({
                error: 'Cổng thanh toán không tồn tại hoặc đang bảo trì',
            });
        }

        if (amount % 1000 !== 0) {
            return res.status(400).json({
                error: 'Số tiền thanh toán phải là bội của 1,000đ',
            });
        }

        if (amount < paygate.minimum_payment || amount > paygate.maximum_payment) {
            return res.status(400).json({
                error: 'Số tiền thanh toán không hợp lệ',
            });
        }

        let optionPaygate = null;
        for (let option of paygate.options) {
            if (option.userbank_id.localbank_id.interbank_code === token && option.userbank_id.localbank_id.status) {
                optionPaygate = option;
                break;
            }
        }
        if (!optionPaygate) {
            return res.status(400).json({
                error: 'Ngân hàng thanh toán không tồn tại',
            });
        }

        const match = description.match(/NAP (\w{8})/);
        const user_id = match ? match[1] : null;

        if (!user_id) {
            return res.status(400).json({
                error: 'Nội dung thanh toán không hợp lệ',
            });
        }

        const user = await User.findOne({ id: user_id }).select('id email full_name');
        if (!user) {
            return res.status(404).json({
                error: 'Người dùng thanh toán không tồn tại',
            });
        }

        const wallet = await Wallet.findOne({ user_id: user._id }).select('total_balance notification_sent');
        if (!wallet) {
            return res.status(400).json({
                error: 'Ví người dùng thanh toán không tồn tại',
            });
        }

        const amountAfterPromotion = (amount * paygate.promotion) / 100 + amount;

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            user._id,
            'recharge',
            'VND',
            'service',
            [
                {
                    title: 'Nạp thêm số dư ví Netcode',
                    description: `Nạp thêm ${convertCurrency(amountAfterPromotion)} vào số dư ví Netcode`,
                    unit_price: amountAfterPromotion,
                    quantity: 1,
                    fees: 0,
                    cycles: null,
                    discount: 0,
                    total_price: amountAfterPromotion,
                },
            ],
            [],
            0,
            amountAfterPromotion,
            amountAfterPromotion,
            'bank_transfer',
            optionPaygate.userbank_id._id,
            'Hoá đơn nạp tiền vào ví Netcode',
            true,
        );
        if (!newInvoice.success) {
            return res.status(400).json({
                error: 'Lỗi xử lý hoá đơn thanh toán',
            });
        }

        // Thông báo email
        await serviceCreateNotification(
            user._id,
            'Email',
            'Thông báo nạp tiền thành công',
            `Quý khách đã nạp thành công số tiền ${convertCurrency(amountAfterPromotion)} vào ví tài khoản Netcode, hoá đơn nạp tiền số #${
                newInvoice.data.id
            }. Xem thêm thông tin tại: https://netcode.vn/billing/invoices/${newInvoice.data.id}`,
            'Hoá đơn nạp tiền đã xuất không thể hoàn tác.',
        );

        // Thông báo web
        await serviceCreateNotification(
            user._id,
            'Web',
            'Thông báo nạp tiền thành công',
            `Kính chào quý khách ${user.full_name}. Quý khách đã nạp thành công số tiền ${convertCurrency(
                amountAfterPromotion,
            )} vào ví tài khoản Netcode, hoá đơn nạp tiền số #${
                newInvoice.data.id
            }. Xem thêm thông tin tại: https://netcode.vn/billing/invoices/${newInvoice.data.id}. Trân trọng!`,
        );

        wallet.notification_sent = false;
        await wallet.save();

        res.status(200).json({
            status: 200,
            message: 'callback_successfully',
        });
    } catch (error) {
        configCreateLog('controllers/recharge/bankTransfer.log', 'controlRechargeBankTransferCallback', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlRechargeBankTransferCallback };
