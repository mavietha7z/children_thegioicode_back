import ThegioicodeAPI from './constructor';
import { configCreateLog } from '~/configs';

export const servicePartnerGetRegions = async () => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get('/api/v2/cloud-server/regions');

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerGetRegions', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerGetImages = async () => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get('/api/v2/cloud-server/images');

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerGetImages', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerGetProducts = async (plan_id) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get(`/api/v2/cloud-server/products/${plan_id}`);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerGetProducts', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerGetOrders = async (page) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get('/api/v2/cloud-server/orders', {}, { page });

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerGetOrders', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerGetOrderDetail = async (order_id) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get(`/api/v2/cloud-server/orders/${order_id}`);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerGetOrders', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerDeploy = async (data) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.post('/api/v2/cloud-server/deploy', data);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerDeploy', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerAction = async (data) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.post('/api/v2/cloud-server/action', data);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerAction', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};
