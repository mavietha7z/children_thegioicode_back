import moment from 'moment-timezone';

import { configCreateLog } from '~/configs';
import { LoginHistory } from '~/models/loginHistory';

const serviceCronLoginHistory = async () => {
    try {
        const thresholdDate = moment.tz('Asia/Ho_Chi_Minh').subtract(6, 'months').toDate();

        const result = await LoginHistory.deleteMany({ created_at: { $lt: thresholdDate } });
        if (result.deletedCount < 1) {
            return;
        }
    } catch (error) {
        configCreateLog('services/cron/loginHistory.log', 'serviceCronLoginHistory', error.message);
    }
};

export { serviceCronLoginHistory };
