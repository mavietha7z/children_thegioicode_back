import { Request } from '~/models/request';
import { configCreateLog } from '~/configs';

const serviceCronRequests = async () => {
    try {
        const result = await Request.deleteMany({});
        if (result.deletedCount < 1) {
            return;
        }
    } catch (error) {
        configCreateLog('services/cron/request.log', 'serviceCronRequests', error.message);
    }
};

export { serviceCronRequests };
