import moment from 'moment';

import { User } from '~/models/user';
import { WalletHistory } from '~/models/walletHistory';
import { configCreateLog, convertCurrency } from '~/configs';
import { serviceUserCreateNewInvoice } from '../user/createInvoice';
import { serviceCreateNotification } from '~/services/user/notification';

const services = [
    { title: 'API Check Login Garena', service: 'Service\\Apis\\Garena_login' },
    { title: 'API Check Login VNGGames', service: 'Service\\Apis\\VngGames_login' },
    { title: 'API Check Login Free Fire', service: 'Service\\Apis\\FreeFire_login' },
];

const servicesDelete = ['Service\\Apis\\FreeFire_login', 'Service\\Apis\\Garena_login', 'Service\\Apis\\VngGames_login'];

const serviceCronWalletHistory = async () => {
    try {
        for (const service of services) {
            // Tìm tất cả biến động số dư 24h trước
            const walletHistories = await WalletHistory.find({ service: service.service });
            if (walletHistories.length < 1) {
                continue;
            }

            // Nhóm các lịch sử biến động theo user
            const userSpending = walletHistories.reduce((acc, history) => {
                if (!acc[history.user_id]) {
                    acc[history.user_id] = 0;
                }

                acc[history.user_id] += history.amount;

                return acc;
            }, {});

            // Tạo hoá đơn cho từng người dùng
            for (const userId in userSpending) {
                const totalSpent = userSpending[userId];

                const newInvoice = await serviceUserCreateNewInvoice(
                    userId,
                    'service',
                    'VND',
                    'service',
                    [
                        {
                            title: `Dịch vụ ${service.title}`,
                            description: `Dịch vụ ${service.title} ngày ${moment(new Date()).format('DD/MM/YYYY')}`,
                            unit_price: Math.abs(totalSpent),
                            quantity: 1,
                            fees: 0,
                            cycles: null,
                            discount: 0,
                            total_price: Math.abs(totalSpent),
                        },
                    ],
                    [],
                    0,
                    totalSpent,
                    totalSpent,
                    'app_wallet',
                    null,
                    `Hoá đơn dịch vụ ${service.title}`,
                    false,
                );
                if (!newInvoice.success) {
                    continue;
                }

                newInvoice.data.status = 'completed';
                await newInvoice.data.save();

                const user = await User.findById(userId).select('email full_name');
                if (!user) {
                    continue;
                }

                // Tạo thông web
                await serviceCreateNotification(
                    userId,
                    'Web',
                    `Hoá đơn mã #${newInvoice.data.id} đã được xuất`,
                    `Kính chào quý khách ${user.full_name}. Hoá đơn sử dụng dịch vụ số #${
                        newInvoice.data.id
                    } với tổng số tiền ${convertCurrency(
                        Math.abs(totalSpent),
                    )} đã được thanh toán thành công. Xem thêm thông tin tại: https://netcode.vn/billing/invoices/${
                        newInvoice.data.id
                    }. Trân trọng!`,
                );
            }
        }

        await WalletHistory.deleteMany({ service: { $in: servicesDelete } });
    } catch (error) {
        configCreateLog('services/cron/walletHistory.log', 'serviceCronWalletHistory', error.message);
    }
};

export { serviceCronWalletHistory };
