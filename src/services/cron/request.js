import { Request } from '~/models/request';
import { configCreateLog } from '~/configs';

const serviceCronRequests = async () => {
    try {
        await Request.deleteMany({});
    } catch (error) {
        configCreateLog('services/cron/request.log', 'serviceCronRequests', error.message);
    }
};

export { serviceCronRequests };
