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

export const servicePartnerRebuild = async (data) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.post('/api/v2/cloud-server/rebuild', data);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerRebuild', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerResizeInfo = async (order_id) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get(`/api/v2/cloud-server/resize/${order_id}`);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerResizeInfo', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerResize = async (data) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.post('/api/v2/cloud-server/resize', data);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerResize', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerRenewInfo = async (order_id) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.get(`/api/v2/cloud-server/renew/${order_id}`);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerRenewInfo', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};

export const servicePartnerRenew = async (data) => {
    try {
        const request = new ThegioicodeAPI();

        const result = await request.post('/api/v2/cloud-server/renew', data);

        return result.data;
    } catch (error) {
        configCreateLog('services/partner/cloudServer.log', 'servicePartnerRenew', error.response?.data?.error || error.message);

        return {
            status: 400,
            error: error.response?.data?.error || 'Lỗi kết nối đến đối tác vui lòng thử lại sau',
        };
    }
};
