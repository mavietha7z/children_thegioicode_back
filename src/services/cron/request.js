import moment from 'moment';

import { Request } from '~/models/request';
import { configCreateLog } from '~/configs';
import { sendMessageBotTelegramApp, sendMessageBotTelegramError } from '~/bot';

const serviceCronRequests = async () => {
    try {
        const result = await Request.deleteMany({});
        if (result.deletedCount < 1) {
            return;
        }

        // Bot telegram
        sendMessageBotTelegramApp(`Xoá dữ liệu Request ngày ${moment(new Date()).format('DD/MM/YYYY')} với ${result.deletedCount} dữ liệu`);
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi cron Request: \n ${error.message}`);
        configCreateLog('services/cron/request.log', 'serviceCronRequests', error.message);
    }
};

export { serviceCronRequests };
