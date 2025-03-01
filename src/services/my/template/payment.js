import axios from 'axios';

import { configCreateLog } from '~/configs';
import { sendMessageBotTelegramError } from '~/bot';

// Thêm tên miền vào cloudflare
const serviceUserAddDomainToCloudflare = async (domain) => {
    try {
        const response = await axios.post(
            'https://api.cloudflare.com/client/v4/zones',
            {
                name: domain,
                account: {
                    id: 'dd6f3843133126942445ba18e0c5976d',
                },
                jump_start: true,
            },
            {
                headers: {
                    'X-Auth-Email': 'chuh83571@gmail.com',
                    'X-Auth-Key': 'f75d38a042c073d8be1e30c4dbe04b3a92eb4',
                    'Content-Type': 'application/json',
                },
            },
        );

        if (!response.data) {
            return { status: 400, success: false, message: 'Lỗi kết nối đến API của Cloudflare của chúng tôi' };
        }

        const data = response.data.result;
        return { data, status: 200, success: true, message: 'Thêm tên miền vào Cloudflare thành công' };
    } catch (error) {
        if (error.response?.data?.errors[0]?.code === 1061) {
            return { status: 400, success: false, message: 'Tên miền đã tồn tại trên Cloudflare của chúng tôi' };
        }

        sendMessageBotTelegramError(`Lỗi thêm tên miền vào Cloudflare: \n\n ${error.message}`);
        configCreateLog('services/my/template/payment.log', 'serviceUserAddDomainToCloudflare', error.message);
        return { status: 500, success: false, message: 'Lỗi thêm tên miền vào Cloudflare' };
    }
};

// Kiểm tra trạng thái tên miền trên cloudflare
const serviceUserCheckDomainStatusOnCloudflare = async (zoneId) => {
    try {
        const response = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
            headers: {
                'X-Auth-Email': 'chuh83571@gmail.com',
                'X-Auth-Key': 'f75d38a042c073d8be1e30c4dbe04b3a92eb4',
                'Content-Type': 'application/json',
            },
        });

        if (!response.data) {
            return { status: 400, success: false, message: 'Lỗi kết nối đến API của Cloudflare' };
        }

        const data = response.data.result;
        if (data.status === 'active') {
            return { data, status: 1, success: true, message: 'Tên miền đã được kích hoạt trên Cloudflare' };
        }
        if (data.status === 'pending') {
            return { data, status: 2, success: true, message: 'Tên miền chưa được kích hoạt, hãy kiểm tra lại nameservers' };
        }
    } catch (error) {
        if (error.response?.data?.errors[0]?.code === 1001) {
            return { status: 404, success: true, message: 'Tên miền chưa được thêm vào Cloudflare của chúng tôi' };
        }

        sendMessageBotTelegramError(`Lỗi kiểm tra trạng thái tên miền trên Cloudflare: \n\n ${error.message}`);
        configCreateLog('services/my/template/payment.log', 'serviceUserCheckDomainStatusOnCloudflare', error.message);
        return { status: 500, success: false, message: 'Lỗi kiểm tra trạng thái tên miền trên Cloudflare' };
    }
};

// Xoá tên miền khỏi cloudflare
const serviceAuthRemoveDomainFromCloudflare = async (zoneId) => {
    try {
        const response = await axios.delete(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
            headers: {
                'X-Auth-Email': 'chuh83571@gmail.com',
                'X-Auth-Key': 'f75d38a042c073d8be1e30c4dbe04b3a92eb4',
                'Content-Type': 'application/json',
            },
        });

        if (!response.data) {
            return { status: 400, success: false, message: 'Lỗi kết nối đến API của Cloudflare' };
        }

        if (response.data.success) {
            return { status: 200, success: true, message: 'Xoá tên miền khỏi Cloudflare thành công' };
        } else {
            return { status: response.status, success: false, message: 'Lỗi xoá tên miền khỏi Cloudflare' };
        }
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi xoá tên miền khỏi Cloudflare: \n\n ${error.message}`);
        configCreateLog('services/my/template/payment.log', 'serviceAuthRemoveDomainFromCloudflare', error.message);
        return { status: 500, success: false, message: 'Lỗi xoá tên miền khỏi Cloudflare' };
    }
};

export { serviceUserAddDomainToCloudflare, serviceAuthRemoveDomainFromCloudflare, serviceUserCheckDomainStatusOnCloudflare };
