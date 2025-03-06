import ThegioicodeAPI from './constructor';
import { configCreateLog } from '~/configs';

export const servicePartnerGetPublicApis = async () => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get('/api/v2/public-api');

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/api.log', 'servicePartnerGetPublicApis', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerGetPublicApiDetail = async (api_id) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get(`/api/v2/public-api/${api_id}`);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/api.log', 'servicePartnerGetPublicApiDetail', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};
