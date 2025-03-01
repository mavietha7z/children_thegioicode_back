import fetch from 'node-fetch';

import { configCreateLog } from '~/configs';
import { sendMessageBotTelegramError } from '~/bot';

const serviceFetchLoginFreeFire = async (url, config, retries = 3, timeout = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${url}/api/auth/player_id_login`, { ...config, signal: controller.signal });
        clearTimeout(timeoutId);

        const json = await response.json();
        if (json.error) {
            return { success: false, status: 200, error: json.error, retries };
        }
        if (json.url) {
            return { success: false, status: 403, error: 'Lỗi giải Captcha vui lòng thử lại sau', retries };
        }

        return { success: true, status: 200, data: json, retries };
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            return { success: false, status: 502, error: 'Máy chủ đăng nhập đang quá tải', retries };
        }

        if (retries > 0) {
            return serviceFetchLoginFreeFire(url, config, retries - 1, timeout);
        } else {
            sendMessageBotTelegramError(`Lỗi đăng nhập Free Fire: \n\n ${error.message}`);
            configCreateLog('services/v2/freefire.log', 'serviceFetchLoginFreeFire', error.message);

            return { success: false, status: 400, error: 'Lỗi đăng nhập vui lòng thử lại', retries };
        }
    }
};

const domain = [
    'https://topup.pk',
    'https://napthe.vn',
    'https://ggtopup.com',
    'https://termgame.com',
    'https://shop.garena.my',
    'https://shop.garena.sg',
    'https://kiosgamer.co.id',
    'https://bdgamesbazar.com',
];

let currentIndex = 0;

const serviceV2GetDomainFreeFire = () => {
    const config = domain[currentIndex];
    currentIndex = (currentIndex + 1) % domain.length;
    return config;
};

export { serviceFetchLoginFreeFire, serviceV2GetDomainFreeFire };
