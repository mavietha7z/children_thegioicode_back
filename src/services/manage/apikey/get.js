import { configCreateLog } from '~/configs';

const serviceAuthGetApikeys = (apikeys = []) => {
    try {
        const data = apikeys.map((item) => {
            const {
                id,
                used,
                status,
                _id: key,
                webhooks,
                category,
                created_at,
                updated_at,
                free_usage,
                key: apikey,
                service_type,
                user_id: user,
                service_id: service,
            } = item;

            return {
                id,
                key,
                used,
                user,
                apikey,
                status,
                service,
                webhooks,
                category,
                free_usage,
                created_at,
                updated_at,
                service_type,
            };
        });

        return data;
    } catch (error) {
        configCreateLog('services/manage/apikey/get.log', 'serviceAuthGetApikeys', error.message);

        return [];
    }
};

export { serviceAuthGetApikeys };
