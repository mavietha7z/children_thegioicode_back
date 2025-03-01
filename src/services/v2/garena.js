import axios from 'axios';
import CryptoJS from 'crypto-js';

import { Api } from '~/models/api';
import { configCreateLog } from '~/configs';
import { sendMessageBotTelegramError } from '~/bot';
import { serviceGetDatadomeGarena, serviceGetHeadersGarena } from './datadome';

const encryptPassword = (password, preV1, preV2) => {
    // Tạo hash MD5 từ mật khẩu
    const s = CryptoJS.MD5(password).toString(CryptoJS.enc.Hex);

    // Tạo hash SHA256 cho s + preV1
    const b = CryptoJS.SHA256(CryptoJS.SHA256(s + preV1).toString(CryptoJS.enc.Hex) + preV2).toString(CryptoJS.enc.Hex);

    // Mã hoá AES-256-ECB
    const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Hex.parse(s), // Sử dụng giá trị s được parse từ hex
        CryptoJS.enc.Hex.parse(b), // Key từ hash b (hex)
        {
            mode: CryptoJS.mode.ECB, // Chế độ mã hóa ECB
            padding: CryptoJS.pad.NoPadding, // Không sử dụng padding
        },
    );

    // Chuyển đổi ciphertext về hex và lấy 32 ký tự đầu tiên
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex).substr(0, 32);
};

const servicePreGarenaLogin = async (username, httpAgent, currentApi) => {
    const url = `https://authgop.garena.com/api/prelogin?app_id=10017&account=${username}&format=json&id=${Date.now()}`;

    try {
        const result = await axios.get(url, { httpAgent, timeout: 5000, headers: serviceGetHeadersGarena(currentApi.datadome) });

        return {
            data: result.data,
            datadome: currentApi.datadome,
        };
    } catch (error) {
        if (error?.response?.data?.url) {
            try {
                let newDatadome = await serviceGetDatadomeGarena(currentApi.proxy);

                if (!newDatadome.success) {
                    newDatadome = await serviceGetDatadomeGarena(currentApi.proxy);
                }

                if (!newDatadome.success) {
                    return null;
                }

                const newResult = await axios.get(url, {
                    httpAgent,
                    timeout: 5000,
                    headers: serviceGetHeadersGarena(newDatadome.datadome),
                });

                return {
                    data: newResult.data,
                    datadome: newDatadome.datadome,
                };
            } catch (error) {
                return null;
            }
        }

        return null;
    }
};

const serviceV2GarenaLogin = async (username, password, httpAgent, currentApi) => {
    try {
        const preLogin = await servicePreGarenaLogin(username, httpAgent, currentApi);

        if (!preLogin || !preLogin.data || !preLogin.datadome) {
            return {
                status: 403,
                success: false,
                error: 'Quá trình xác thực đã thất bại',
            };
        }
        if (preLogin.data.error === 'error_no_account') {
            return {
                status: 200,
                success: false,
                error: 'Tài khoản hoặc mật khẩu bị sai',
            };
        }
        if (preLogin.data.error) {
            return {
                status: 403,
                success: false,
                error: preLogin.data.error,
            };
        }

        const loginHeaders = serviceGetHeadersGarena(preLogin.datadome);
        const encryptedPassword = encryptPassword(password, preLogin.data.v1, preLogin.data.v2);
        const url = `https://authgop.garena.com/api/login?app_id=10017&account=${username}&password=${encryptedPassword}&redirect_uri=https://napthe.vn/app/&format=json&id=${Date.now()}`;

        const result = await axios.get(url, { headers: loginHeaders, timeout: 5000, httpAgent });

        if (result.data.error === 'error_auth') {
            return {
                status: 200,
                success: false,
                error: 'Mật khẩu tài khoản bị sai',
            };
        }
        if (result.data.error) {
            return {
                status: 403,
                success: false,
                error: result.data.error,
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi đăng nhập Garena: \n\n ${error.message}`);
        configCreateLog('services/v2/freefire.log', 'serviceV2GarenaLogin', error.message);

        return {
            status: 500,
            success: false,
            error: error.message,
        };
    }
};

export { serviceV2GarenaLogin };
