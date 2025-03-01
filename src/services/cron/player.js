import moment from 'moment-timezone';

import { Player } from '~/models/player';
import { configCreateLog } from '~/configs';
import { sendMessageBotTelegramApp, sendMessageBotTelegramError } from '~/bot';

const serviceCronPlayers = async () => {
    try {
        const thresholdDate = moment.tz('Asia/Ho_Chi_Minh').subtract(30, 'days').toDate();

        const result = await Player.deleteMany({ created_at: { $lt: thresholdDate } });
        if (result.deletedCount < 1) {
            return;
        }

        // Bot telegram với múi giờ chuẩn
        const currentDate = moment.tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
        sendMessageBotTelegramApp(`Xoá dữ liệu Player ngày ${currentDate} với ${result.deletedCount} dữ liệu`);
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi cron Player: \n ${error.message}`);
        configCreateLog('services/cron/player.log', 'serviceCronPlayers', error.message);
    }
};

export { serviceCronPlayers };
