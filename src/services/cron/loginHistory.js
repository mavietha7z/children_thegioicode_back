import moment from 'moment-timezone';

import { configCreateLog } from '~/configs';
import { LoginHistory } from '~/models/loginHistory';
import { sendMessageBotTelegramApp, sendMessageBotTelegramError } from '~/bot';

const serviceCronLoginHistory = async () => {
    try {
        const thresholdDate = moment.tz('Asia/Ho_Chi_Minh').subtract(6, 'months').toDate();

        const result = await LoginHistory.deleteMany({ created_at: { $lt: thresholdDate } });
        if (result.deletedCount < 1) {
            return;
        }

        // Gửi thông báo Telegram
        const currentDate = moment.tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
        sendMessageBotTelegramApp(`Xoá dữ liệu loginHistory ngày ${currentDate} với ${result.deletedCount} dữ liệu`);
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi cron loginHistory: \n ${error.message}`);
        configCreateLog('services/cron/loginHistory.log', 'serviceCronLoginHistory', error.message);
    }
};

export { serviceCronLoginHistory };
