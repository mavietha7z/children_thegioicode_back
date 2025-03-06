import { Api } from '~/models/api';
import { configCreateLog } from '~/configs';
import { servicePartnerGetPublicApiDetail } from '../partner/api';

const serviceCronPublicApis = async () => {
    try {
        const apis = await Api.find({});
        if (apis.length < 1) {
            return;
        }

        for (let i = 0; i < apis.length; i++) {
            const api = apis[i];

            const result = await servicePartnerGetPublicApiDetail(api.partner_id);
            if (result.status !== 200) {
                continue;
            }

            api.updated_at = Date.now();
            api.status = result.data.status;
            api.image_url = result.data.image_url;

            await api.save();
        }
    } catch (error) {
        configCreateLog('services/cron/api.log', 'serviceCronPublicApis', error.message);
    }
};

export { serviceCronPublicApis };
