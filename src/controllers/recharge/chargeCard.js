import { Wallet } from '~/models/wallet';
import { Paygate } from '~/models/paygate';
import { convertCurrency } from '~/configs';
import { configCreateLog } from '~/configs';
import { Charging } from '~/models/charging';
import { checkStatusCharing } from '~/services/my/recharge/charging';
import { serviceCreateNotification } from '~/services/user/notification';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';

const controlRechargeCardCallback = async (req, res) => {
    try {
        const { declared_value, value, code, serial, telco } = req.body;

        const charging = await Charging.findOne({ telco, code, serial, declared_value }).populate({
            path: 'user_id',
            select: 'id email full_name',
        });
        if (!charging) {
            return res.status(404).json({ message: 'Giao dịch không tồn tại' });
        }

        const { status, message, description } = checkStatusCharing(req.body.status, req.body.message);

        let amount = 0;
        if (status === 1) {
            const paygate = await Paygate.findOne({ callback_code: 'recharge_card', status: true })
                .select('name service callback_code discount bonus_point minimum_payment maximum_payment promotion status options')
                .populate({
                    path: 'options.userbank_id',
                    select: 'id user_id localbank_id account_number account_holder account_password service',
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

            let optionPaygate = null;
            for (let option of paygate.options) {
                optionPaygate = option;
                break;
            }
            if (!optionPaygate) {
                return res.status(400).json({
                    error: 'Ngân hàng thanh toán không tồn tại',
                });
            }

            const wallet = await Wallet.findOne({ user_id: charging.user_id._id }).select('total_balance notification_sent');
            if (!wallet) {
                return res.status(400).json({
                    error: 'Ví người dùng thanh toán không tồn tại',
                });
            }

            const amountAfterPromotion = declared_value - (declared_value * paygate.discount) / 100;

            amount = amountAfterPromotion;

            // Tạo hoá đơn
            const newInvoice = await serviceUserCreateNewInvoice(
                charging.user_id._id,
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
                'app_wallet',
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
                charging.user_id._id,
                'Email',
                'Thông báo nạp tiền thành công',
                `Quý khách đã nạp thành công số tiền ${convertCurrency(
                    amountAfterPromotion,
                )} vào ví tài khoản Netcode, hoá đơn nạp tiền số #${
                    newInvoice.data.id
                }. Xem thêm thông tin tại: https://netcode.vn/billing/invoices/${newInvoice.data.id}`,
                'Hoá đơn nạp tiền đã xuất không thể hoàn tác.',
            );

            // Thông báo web
            await serviceCreateNotification(
                charging.user_id._id,
                'Web',
                'Thông báo nạp tiền thành công',
                `Kính chào quý khách ${charging.user_id.full_name}. Quý khách đã nạp thành công số tiền ${convertCurrency(
                    amountAfterPromotion,
                )} vào ví tài khoản Netcode, hoá đơn nạp tiền số #${
                    newInvoice.data.id
                }. Xem thêm thông tin tại: https://netcode.vn/billing/invoices/${newInvoice.data.id}. Trân trọng!`,
            );

            wallet.notification_sent = false;
            await wallet.save();
        }

        charging.value = value;
        charging.amount = amount;
        charging.status = status;
        charging.message = message;
        charging.description = description;
        charging.approved_at = Date.now();
        await charging.save();

        res.status(200).json({
            status: 200,
            message: 'callback_successfully',
        });
    } catch (error) {
        configCreateLog('controllers/recharge/chargeCard.log', 'controlRechargeCardCallback', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlRechargeCardCallback };
