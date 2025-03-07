import moment from 'moment-timezone';

import { User } from '~/models/user';
import { Wallet } from '~/models/wallet';
import { BonusPoint } from '~/models/bonusPoint';
import { serviceMembershipUser } from './membership';
import { WalletHistory } from '~/models/walletHistory';
import { serviceCreateNotification } from './notification';
import { configCreateLog, convertCurrency } from '~/configs';

const hoursRemaining = 12;

const serviceCalculateBalance = async (user_id, hours = hoursRemaining) => {
    const oneDayAgo = moment().subtract(hours, 'hours').toDate();

    // Lấy tổng số tiền đã chi tiêu trong 12 giờ qua
    const totalSpent = await WalletHistory.aggregate([
        { $match: { user_id, type: 'withdraw', created_at: { $gte: oneDayAgo } } },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
    ]);

    return totalSpent.length ? totalSpent[0].totalSpent : 0;
};

const serviceCreateWalletHistoryUser = async (user_id, walletHistory, bonusHistory) => {
    const { bonus_point, bonus_type, reason } = bonusHistory;
    const { type, before, amount, after, service, description } = walletHistory;

    try {
        if (!['service', 'deposit', 'withdraw', 'recharge', 'withdrawal'].includes(type)) {
            return false;
        }

        let wallet = await Wallet.findOne({ user_id });
        const user = await User.findById(user_id).select('email full_name');

        // Trường hợp cộng tiền vào số dư chính (deposit)
        if (type === 'deposit') {
            // Cộng tiền vào số dư chính
            wallet.credit_balance += amount;

            // Cập nhật tổng số dư
            wallet.total_balance = wallet.credit_balance + wallet.bonus_balance;
        }

        // Trường hợp nạp tiền (recharge)
        if (type === 'recharge') {
            // Cộng tiền vào số dư chính
            wallet.credit_balance += amount;

            // Cập nhật tổng số dư
            wallet.total_balance = wallet.credit_balance + wallet.bonus_balance;

            // Cập nhật tổng tiền đã nạp
            wallet.total_recharge += amount;
        }

        // Số tiền phải luôn là số dương
        let remainingAmount = Math.abs(amount);

        // Trường hợp trừ tiền từ tổng số dư (withdraw)
        if (type === 'withdraw' || type === 'service') {
            // Trừ số dư chính nếu còn đủ
            if (wallet.credit_balance >= remainingAmount) {
                wallet.credit_balance -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= wallet.credit_balance;
                wallet.credit_balance = 0;

                // Trừ số dư khuyến mãi nếu còn đủ
                if (wallet.bonus_balance >= remainingAmount) {
                    wallet.bonus_balance -= remainingAmount;
                } else {
                    wallet.bonus_balance = 0;
                }
            }

            // Cập nhật tổng số dư
            wallet.total_balance = wallet.credit_balance + wallet.bonus_balance;
        }

        // Trường hợp rút tiền từ số dư có thể rút (withdrawal)
        if (type === 'withdrawal') {
            // Trừ tiền từ số dư có thể rút (main_balance)
            wallet.main_balance -= remainingAmount;

            // Cập nhật tổng tiền đã rút
            wallet.total_withdrawal += remainingAmount;
        }

        // Điểm thưởng
        if (bonus_point !== 0) {
            wallet.bonus_point += bonus_point;
            if (bonus_type === 'income') {
                // Tính toán thời gian hết hạn của điểm thưởng
                let bonus_point_expiry;
                if (wallet.bonus_point_expiry) {
                    // Nếu đã có thời gian hết hạn, cộng thêm 15 ngày vào thời gian hiện tại
                    bonus_point_expiry = new Date(wallet.bonus_point_expiry.getTime() + 15 * 24 * 60 * 60 * 1000);
                } else {
                    // Nếu chưa có thời gian hết hạn, tính 15 ngày từ thời điểm hiện tại
                    bonus_point_expiry = new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000);
                }

                // Đảm bảo thời gian hết hạn là 23h59m59s của ngày đó
                bonus_point_expiry.setHours(23, 59, 59, 999);

                wallet.total_bonus_point += bonus_point;
                wallet.bonus_point_expiry = bonus_point_expiry;
            }

            // Tạo lịch sử điểm thưởng
            await new BonusPoint({
                user_id,
                wallet_id: wallet._id,
                bonus_point,
                bonus_type,
                reason,
                status: 'processed',
            }).save();
        }

        // Thông báo số dư sắp hết, nếu chi tiêu trong 12 giờ qua lớn hơn 0, tính toán số giờ sử dụng còn lại
        const totalSpent = await serviceCalculateBalance(user_id, hoursRemaining);
        const resultTotalSpent = Math.abs(totalSpent);
        if (resultTotalSpent > 0) {
            const hourRemaining = (wallet.total_balance / resultTotalSpent) * hoursRemaining;

            // Nếu số dư còn lại đủ sử dụng trong 12 giờ hoặc ít hơn, gửi thông báo
            if (hourRemaining <= hoursRemaining && !wallet.notification_sent) {
                const amountConvert = convertCurrency(wallet.total_balance);

                const title = `Số dư tài khoản sẽ hết sau ${hoursRemaining} giờ`;

                // Thông báo email
                const isSendMail = await serviceCreateNotification(
                    user_id,
                    'Email',
                    title,
                    `Số dư tài khoản của quý khách hiện tại là <b>${amountConvert}</b> và có thể sẽ hết sau ${hoursRemaining} giờ tới. Để tránh việc dịch vụ đang sử dụng của bạn bị vô hiệu hoá, vui lòng nạp thêm tiền tại đây: https://netcode.vn/billing`,
                    'Số giờ còn lại được tính dựa trên các dịch vụ của bạn đang sử dụng, số dư có thể hết sớm hơn dự kiến.',
                );

                // Thông báo web
                await serviceCreateNotification(
                    user_id,
                    'Web',
                    title,
                    `Kính chào quý khách ${user.full_name}. Số dư tài khoản Netcode của bạn hiện tại là ${amountConvert} và có thể sẽ hết sau ${hoursRemaining} giờ tới. Để tránh việc dịch vụ đang sử dụng của bạn bị vô hiệu hoá, vui lòng nạp thêm tiền tại đây https://netcode.vn/billing. Số giờ còn lại được tính dựa trên các dịch vụ của bạn đang sử dụng, số dư có thể hết sớm hơn dự kiến. Trân trọng!`,
                );

                if (isSendMail) {
                    wallet.notification_sent = true;
                }
            }
        }

        // Lưu thay đổi
        await wallet.save();

        // Tạo biến động số dư
        await new WalletHistory({
            type,
            after,
            before,
            amount,
            service,
            user_id,
            bonus_point,
            description,
        }).save();

        // Xử lý membership
        await serviceMembershipUser(user_id);

        return true;
    } catch (error) {
        configCreateLog('services/user/walletHistory.log', 'serviceCreateWalletHistoryUser', error.message);

        return false;
    }
};

export { serviceCreateWalletHistoryUser };
