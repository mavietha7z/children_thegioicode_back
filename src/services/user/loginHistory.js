import geoIp from 'geoip-lite';

import { configCreateLog } from '~/configs';
import { LoginHistory } from '~/models/loginHistory';

const serviceCreateLoginHistoryUser = async (user_id, ip, req) => {
    try {
        const address = geoIp.lookup(ip);

        await new LoginHistory({
            ip,
            user_id,
            device: req.device,
            user_agent: req.headers['user-agent'],
            address: address?.city ? address?.city : null,
        }).save();

        return true;
    } catch (error) {
        configCreateLog('services/user/loginHistory.log', 'serviceCreateLoginHistoryUser', error.message);
        return false;
    }
};

export { serviceCreateLoginHistoryUser };
