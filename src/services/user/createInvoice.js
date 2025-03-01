import { User } from '~/models/user';
import { Wallet } from '~/models/wallet';
import { Invoice } from '~/models/invoice';
import { isValidMongoId } from '~/validators';
import { configCreateLog, convertCurrency } from '~/configs';
import { serviceCreateWalletHistoryUser } from './walletHistory';
import { sendMessageBotTelegramApp, sendMessageBotTelegramError } from '~/bot';

const requiredKeys = ['title', 'description', 'unit_price', 'quantity', 'fees', 'cycles', 'discount', 'total_price'];

const serviceUserCreateNewInvoice = async (
    user_id,
    type,
    currency,
    recurring_type,
    products = [],
    coupons = [],
    bonus_point = 0,
    total_price = 0,
    total_payment = 0,
    pay_method,
    userbank_id = null,
    description = '',
    is_pay = false,
) => {
    try {
        if (!isValidMongoId(user_id)) {
            return { success: false, message: 'ID người dùng không hợp lệ', data: null };
        }
        const user = await User.findById(user_id).select('id email full_name');
        if (!user) {
            return { success: false, message: 'Người dùng không tồn tại', data: null };
        }

        if (!['service', 'deposit', 'withdraw', 'recharge', 'withdrawal'].includes(type)) {
            return { success: false, message: 'Loại hoá đơn không hợp lệ', data: null };
        }
        if (!['VND', 'USD'].includes(currency)) {
            return { success: false, message: 'Loại tiền tệ không hợp lệ', data: null };
        }
        if (!['buy', 'service', 'register', 'renew', 'upgrade', 'destroy'].includes(recurring_type)) {
            return { success: false, message: 'Loại định kỳ không hợp lệ', data: null };
        }
        if (!Array.isArray(products) || products.length === 0) {
            return { success: false, message: 'Danh sách items không hợp lệ', data: null };
        }
        for (const item of products) {
            if (typeof item !== 'object' || item === null) {
                return { success: false, message: 'Items không đúng định dạng', data: null };
            }

            for (const key of requiredKeys) {
                if (!item.hasOwnProperty(key)) {
                    return { success: false, message: 'Các trường items không đầy đủ', data: null };
                }

                if (key === 'title' && !item.title) {
                    return { success: false, message: 'Trường tiêu đề không hợp lệ', data: null };
                }
                if (key === 'description' && !item.description) {
                    return { success: false, message: 'Trường mô tả không hợp lệ', data: null };
                }
                if (key === 'unit_price' && typeof item.unit_price !== 'number') {
                    return { success: false, message: 'Trường đơn giá không hợp lệ', data: null };
                }
                if (key === 'quantity' && typeof item.quantity !== 'number') {
                    return { success: false, message: 'Trường số lượng không hợp lệ', data: null };
                }
                if (key === 'fees' && typeof item.fees !== 'number') {
                    return { success: false, message: 'Trường phí không hợp lệ', data: null };
                }
                if (key === 'discount' && typeof item.discount !== 'number') {
                    return { success: false, message: 'Trường giảm giá không hợp lệ', data: null };
                }
                if (key === 'total_price' && typeof item.total_price !== 'number') {
                    return { success: false, message: 'Trường tổng giá không hợp lệ', data: null };
                }
            }
        }
        if (!['credit_card', 'debit_card', 'bank_transfer', 'e-wallet', 'app_wallet'].includes(pay_method)) {
            return { success: false, message: 'Phương thức thanh toán không hợp lệ', data: null };
        }

        const newInvoice = await new Invoice({
            user_id,
            type,
            currency,
            recurring_type,
            products,
            coupons,
            status: 'pending',
            bonus_point,
            total_price,
            total_payment,
            pay_method,
            userbank_id,
            description,
        }).save();

        // Thêm lịch sử biến đổi số dư
        if (is_pay) {
            const wallet = await Wallet.findOne({ user_id }).select('id total_balance main_balance');
            if (!wallet) {
                return { success: false, message: 'Ví người dùng không tồn tại', data: null };
            }

            let before = 0;
            let amount = 0;
            let after = 0;
            if (newInvoice.type === 'deposit' || newInvoice.type === 'recharge') {
                before = wallet.total_balance;
                amount = newInvoice.total_payment;
                after = wallet.total_balance + newInvoice.total_payment;
            }
            if (newInvoice.type === 'service' || newInvoice.type === 'withdraw') {
                before = wallet.total_balance;
                amount = newInvoice.total_payment;
                after = wallet.total_balance - Math.abs(newInvoice.total_payment);
            }
            if (newInvoice.type === 'withdrawal') {
                before = wallet.main_balance;
                amount = newInvoice.total_payment;
                after = wallet.main_balance - Math.abs(newInvoice.total_payment);
            }

            const walletHistory = {
                type: newInvoice.type,
                before,
                amount,
                after,
                service: newInvoice.id,
                description: `Thanh toán hoá đơn #${newInvoice.id}`,
            };
            const bonusHistory = {
                bonus_point: newInvoice.bonus_point,
                bonus_type: 'income',
                reason: {
                    invoice_id: newInvoice.id,
                    service: `Thanh toán hoá đơn #${newInvoice.id}`,
                },
            };

            const isWalletHistory = await serviceCreateWalletHistoryUser(user._id, walletHistory, bonusHistory);
            if (!isWalletHistory) {
                return { success: false, message: 'Lỗi xử lý thanh toán hoá đơn', data: null };
            }

            newInvoice.status = 'completed';
            newInvoice.updated_at = Date.now();
            newInvoice.processed_at = Date.now();
            await newInvoice.save();
        }

        // Bot telegram
        const messageBotTele = `Khách hàng: \n ${user.email} \n ${user.full_name} \n\n Xuất hoá đơn mã #${
            newInvoice.id
        } với số tiền thanh toán ${convertCurrency(Math.abs(total_payment))}. \n\n Nội dung: ${newInvoice.description}`;
        sendMessageBotTelegramApp(messageBotTele);

        return { success: true, message: 'Tạo hoá đơn thanh toán thành công', data: newInvoice };
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi khách hàng tạo hoá đơn: \n\n ${error.message}`);
        configCreateLog('services/user/createInvoice.log', 'serviceUserCreateNewInvoice', error.message);

        return { success: false, message: 'Lỗi xử lý hoá đơn thanh toán', data: null };
    }
};

export { serviceUserCreateNewInvoice };
