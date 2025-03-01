import moment from 'moment-timezone';

import { configCreateLog } from '~/configs';
import { Notification } from '~/models/notification';

const serviceCronNotification = async () => {
    try {
        const thresholdDate = moment.tz('Asia/Ho_Chi_Minh').subtract(6, 'months').toDate();

        const result = await Notification.deleteMany({ created_at: { $lt: thresholdDate } });
        if (result.deletedCount < 1) {
            return;
        }
    } catch (error) {
        configCreateLog('services/cron/notification.log', 'serviceCronNotification', error.message);
    }
};

export { serviceCronNotification };
