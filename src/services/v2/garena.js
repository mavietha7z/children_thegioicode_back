import axios from 'axios';
import { configCreateLog } from '~/configs';

const serviceFetchLoginGarena = async (url, data, apikey) => {
    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apikey}`,
            },
            timeout: 5000,
            family: 4,
        });

        if (response.data.error) {
            return { success: false, status: 200, error: response.data.error };
        }

        return { success: true, status: 200, data: response.data.data };
    } catch (error) {
        if (error?.response?.data?.error) {
            return { success: false, status: 400, error: error.response.data.error };
        }

        configCreateLog('services/v2/garena.log', 'serviceFetchLoginGarena', error.message);
        return { success: false, status: 400, error: 'Lỗi đăng nhập vui lòng thử lại' };
    }
};

export { serviceFetchLoginGarena };
