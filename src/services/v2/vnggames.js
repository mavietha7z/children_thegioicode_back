import axios from 'axios';

import { configCreateLog } from '~/configs';
import { sendMessageBotTelegramError } from '~/bot';

const serviceGetClientKey = async (frontID) => {
    const data = `shopfrontID=${frontID}`;

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://pay.mto.zing.vn/lp/login/getShopfront',
        headers: {
            accept: '*/*',
            'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            origin: 'https://shop.vnggames.com',
            priority: 'u=1, i',
            referer: 'https://shop.vnggames.com/',
            'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        },
        data: data,
    };

    try {
        const response = await axios.request(config);

        return {
            success: true,
            data: response.data.data.clientKey,
        };
    } catch (error) {
        return {
            data: null,
            success: false,
        };
    }
};

const serviceLoginVngGamesByQuick = async (roleID, frontID) => {
    const clientKey = await serviceGetClientKey(frontID);
    if (!clientKey.success) {
        return { success: false, status: 400, error: 'Lỗi lấy client key từ máy chủ' };
    }

    const data = `platform=mobile&clientKey=${clientKey.data}&loginType=9&lang=VI&roleID=${roleID}&roleID=${roleID}&roleName=${roleID}`;

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://billing.vnggames.com/fe/api/auth/quick',
        headers: {
            accept: '*/*',
            'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            origin: 'https://shop.vnggames.com',
            priority: 'u=1, i',
            referer: 'https://shop.vnggames.com/',
            'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        data: data,
    };

    try {
        const response = await axios.request(config);

        if (!response.data) {
            return { success: false, status: 400, error: 'Lỗi gửi yêu cầu đăng nhập đến máy chủ' };
        }
        if (response.data.returnCode !== 1) {
            return {
                status: 200,
                success: false,
                error: response.data.returnMessage,
            };
        }

        const data = {
            role_id: roleID,
            user_id: response.data.data.userID,
            jwt_token: response.data.data.jtoken,
            server_id: response.data.data.serverID,
            role_name: response.data.data.roleName,
            login_type: response.data.data.loginType,
            server_name: response.data.data.serverName,
        };

        return {
            data,
            status: 200,
            success: true,
        };
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi đăng nhập VngGames Quick: \n\n ${error.message}`);
        configCreateLog('services/v2/vnggames.log', 'serviceLoginVngGamesByQuick', error.message);
        return {
            data: null,
            status: 400,
            success: false,
            error: 'Lỗi gửi yêu cầu đăng nhập đến máy chủ',
        };
    }
};

const serviceLoginVngGamesByRole = async (roleID, shopfrontID) => {
    const data = `roleID=${roleID}&loginType=9&shopfrontID=${shopfrontID}&lang=VI`;

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://pay.mto.zing.vn/lp/login/loginByRole',
        headers: {
            accept: '*/*',
            'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            origin: 'https://shop.vnggames.com',
            priority: 'u=1, i',
            referer: 'https://shop.vnggames.com/',
            'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        },
        data: data,
    };

    try {
        const response = await axios.request(config);

        if (!response.data) {
            return { success: false, status: 400, error: 'Lỗi gửi yêu cầu đăng nhập đến máy chủ' };
        }
        if (response.data.returnCode !== 1) {
            return {
                status: 200,
                success: false,
                error: response.data.returnMessage,
            };
        }

        const data = {
            role_id: roleID,
            user_id: response.data.data.userID,
            jwt_token: response.data.data.jtoken,
            server_id: response.data.data.serverID,
            role_name: response.data.data.roleName,
            login_type: response.data.data.loginType,
            server_name: response.data.data.serverName,
        };

        return {
            data,
            status: 200,
            success: true,
        };
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi đăng nhập VngGames Role: \n\n ${error.message}`);
        configCreateLog('services/v2/vnggames.log', 'serviceLoginVngGamesByRole', error.message);
        return {
            data: null,
            status: 400,
            success: false,
            error: 'Lỗi gửi yêu cầu đăng nhập đến máy chủ',
        };
    }
};

export { serviceLoginVngGamesByQuick, serviceLoginVngGamesByRole };
