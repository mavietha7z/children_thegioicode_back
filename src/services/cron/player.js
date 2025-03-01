import moment from 'moment-timezone';

import { Player } from '~/models/player';
import { configCreateLog } from '~/configs';

const serviceCronPlayers = async () => {
    try {
        const thresholdDate = moment.tz('Asia/Ho_Chi_Minh').subtract(30, 'days').toDate();

        const result = await Player.deleteMany({ created_at: { $lt: thresholdDate } });
        if (result.deletedCount < 1) {
            return;
        }
    } catch (error) {
        configCreateLog('services/cron/player.log', 'serviceCronPlayers', error.message);
    }
};

export { serviceCronPlayers };
