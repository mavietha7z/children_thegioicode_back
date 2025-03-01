import { serviceCronSendMail } from '~/services/cron/sendMail';
import { serviceCronCloudflare } from '~/services/cron/cloudflare';
import { serviceCronCloudServer } from '~/services/cron/cloudServer';
import { serviceCronExpiredOrderTryIt } from '~/services/cron/expiredTryIt';
import { serviceCronRemoveOrderFromCart, serviceCronUnpaidOrder } from '~/services/cron/order';

export const startIntervalTasks = () => {
    // Tác vụ lặp mỗi 8 giây
    setInterval(async () => {
        // Send mail
        await serviceCronSendMail();
    }, 8000);

    // Tác vụ lặp mỗi 20 giây
    setInterval(async () => {
        // Cloud server
        await serviceCronCloudServer();
    }, 20000);

    // Tác vụ lặp mỗi 1 phút
    setInterval(async () => {
        // Order Cloud Server Try It
        await serviceCronExpiredOrderTryIt();
    }, 60000);

    // Tác vụ lặp mỗi 3 phút
    setInterval(async () => {
        // Cloudflare
        await serviceCronCloudflare();
    }, 3 * 60 * 1000);

    // Tác vụ lặp mỗi 5 phút
    setInterval(async () => {
        // Order
        await serviceCronUnpaidOrder();

        // Cart
        await serviceCronRemoveOrderFromCart();
    }, 5 * 60 * 1000);
};
