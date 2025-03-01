import { scheduleJob } from 'node-schedule';

import { serviceCronPlayers } from '~/services/cron/player';
import { serviceCronRequests } from '~/services/cron/request';
import { serviceCronBackupDatabase } from '~/services/cron/database';
import { serviceCronLoginHistory } from '~/services/cron/loginHistory';
import { serviceCronNotification } from '~/services/cron/notification';
import { serviceCronWalletHistory } from '~/services/cron/walletHistory';
import { serviceCronExpiredBonusPoints, serviceCronExpiredOrders } from '~/services/cron/expired';

export const startScheduleTasks = () => {
    // Tác vụ chạy lúc 23:59:59 mỗi ngày
    scheduleJob('59 59 23 * * *', async () => {
        // Player
        await serviceCronPlayers();

        // Request
        await serviceCronRequests();

        // Wallet history
        await serviceCronWalletHistory();
    });

    // Tác vụ chạy lúc 00:00:00 mỗi ngày
    scheduleJob('0 0 0 * * *', async () => {
        // Expired orders
        await serviceCronExpiredOrders();

        // Bonus points
        await serviceCronExpiredBonusPoints();
    });

    // Tác vụ chạy lúc 01:00:00 mỗi ngày
    scheduleJob('0 0 1 * * *', async () => {
        // Login History
        await serviceCronLoginHistory();

        // Notification
        await serviceCronNotification();
    });

    // Tác vụ chạy lúc 00:20:00 mỗi ngày
    scheduleJob('20 0 * * *', async () => {
        // Backup database
        await serviceCronBackupDatabase();
    });
};
