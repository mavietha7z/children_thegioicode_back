import moment from 'moment-timezone';

import { configCreateLog } from '~/configs';
import { Notification } from '~/models/notification';
import { sendMessageBotTelegramApp, sendMessageBotTelegramError } from '~/bot';

const serviceCronNotification = async () => {
    try {
        const thresholdDate = moment.tz('Asia/Ho_Chi_Minh').subtract(6, 'months').toDate();

        const result = await Notification.deleteMany({ created_at: { $lt: thresholdDate } });
        if (result.deletedCount < 1) {
            return;
        }

        // Gửi thông báo Telegram
        const currentDate = moment.tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
        sendMessageBotTelegramApp(`Xoá dữ liệu Notification ngày ${currentDate} với ${result.deletedCount} dữ liệu`);
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi cron Notification: \n ${error.message}`);
        configCreateLog('services/cron/notification.log', 'serviceCronNotification', error.message);
    }
};

export { serviceCronNotification };
