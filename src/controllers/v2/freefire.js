import geoIp from 'geoip-lite';
import { HttpsProxyAgent } from 'https-proxy-agent';

import { Player } from '~/models/player';
import { configCreateLog } from '~/configs';
import { serviceGetProxyInfo } from '~/services/v2/proxy';
import { controlCreatePlayer } from '../manage/api/player';
import { controlCreateRequest } from '../manage/api/request';
import { serviceV2GetDatadomeFreeFire } from '~/services/v2/datadome';
import { serviceFetchLoginFreeFire, serviceV2GetDomainFreeFire } from '~/services/v2/freefire';

const controlV2LoginFreeFire = async (req, res) => {
    const { account_id } = req.body;
    const { _id: service_id } = req.currentApi;

    if (!req.apiProxy) {
        return res.status(404).json({
            error: 'Proxy key không tồn tại',
        });
    }

    let status = null;
    let response = null;
    let accounts = null;
    let requests = null;
    try {
        const proxyInfo = await serviceGetProxyInfo(req.apiProxy);
        let proxy = null;
        if (proxyInfo) {
            proxy = {
                host: proxyInfo.ip,
                port: proxyInfo.port,
            };
        }

        const datadome = await serviceV2GetDatadomeFreeFire();
        if (!datadome) {
            return res.status(400).json({ error: 'Lấy thông tin datadome thất bại' });
        }

        const domain = serviceV2GetDomainFreeFire();
        const headers = {
            GET: '/api/prelogin?app_id=10100&account=a&format=json&id=1719318977465 HTTP/1.1',
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            Connection: 'keep-alive',
            'Content-Type': 'application/json',
            Cookie: `_ga_XB5PSHEQB4=GS1.1.1717740204.1.1.1717741125.0.0.0; _ga_ZVT4QTM70P=GS1.1.1717860132.1.0.1717860135.0.0.0; _ga_KE3SY7MRSD=GS1.1.1718120539.1.1.1718120539.0.0.0; _ga_RF9R6YT614=GS1.1.1718120542.1.0.1718120542.0.0.0; _ga=GA1.1.1225644985.1717685902; token_session=f9094272506759b10a3ae8aaf49fd45c60d3f80f866c302a077714e1dba6e468a6897fae30d7ee89d4cfb031d4b9e549; _ga_G8QGMJPWWV=GS1.1.1719149637.14.1.1719151040.0.0.0; datadome=${datadome}; _ga_1M7M9L6VPX=GS1.1.1719318965.10.0.1719318965.0.0.0`,
            Referer: 'https://sso.garena.com/universal/login?app_id=10100&redirect_uri=https%3A%2F%2Faccount.garena.com%2F&locale=vi-VN',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
                'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'x-datadome-clientid': datadome,
        };

        const data = {
            app_id: 100067,
            app_server_id: 0,
            login_id: account_id,
        };

        let config = {
            headers,
            method: 'POST',
            body: JSON.stringify(data),
        };

        if (proxy) {
            const agent = new HttpsProxyAgent(proxy);
            config.agent = agent;
        }

        const result = await serviceFetchLoginFreeFire(domain, config, 3, 5000);

        const address = geoIp.lookup(proxy?.host);
        if (result.success) {
            accounts = {
                nickname: result.data.nickname,
                account_id,
                img_url: result.data.img_url,
                region: result.data.region,
                open_id: result.data.open_id,
                service_id,
            };
            status = result.status;
            response = {
                status,
                data: result.data,
            };
            requests = {
                req,
                user_id: req.user._id,
                ip: proxy?.host,
                address: address?.city,
                proxy,
                response,
                status,
                service_id,
            };
        } else {
            const freeFire = await Player.findOne({ 'account_freefire.account_id': account_id });
            if (freeFire) {
                status = 200;
                response = {
                    status,
                    data: {
                        img_url: freeFire.account_freefire.img_url,
                        region: freeFire.account_freefire.region,
                        nickname: freeFire.account_freefire.nickname,
                        open_id: freeFire.account_freefire.open_id,
                    },
                };
                requests = {
                    req,
                    user_id: req.user._id,
                    ip: proxy?.host,
                    address: address?.city,
                    proxy,
                    response,
                    status,
                    service_id,
                };
            } else {
                if (result.error === 'invalid_id') {
                    status = result.status;
                    response = { error: result.error };
                    requests = {
                        req,
                        user_id: req.user._id,
                        ip: proxy?.host,
                        address: address?.city,
                        proxy,
                        response,
                        status,
                        service_id,
                    };
                } else {
                    status = result.status;
                    response = { error: result.error };
                    requests = {
                        req,
                        user_id: req.user._id,
                        ip: proxy?.host,
                        address: address?.city,
                        proxy,
                        response,
                        status,
                        service_id,
                    };
                }
            }
        }
    } catch (error) {
        status = 500;
        response = { error: 'Đã xảy ra lỗi khi gửi yêu cầu' };

        configCreateLog('controllers/v2/freefire.log', 'controlV2LoginFreeFire', error.message);
    } finally {
        if (accounts) {
            await controlCreatePlayer(accounts, 'freefire');
        }
        if (requests) {
            await controlCreateRequest(requests);
        }

        res.status(status).json(response);
    }
};

export { controlV2LoginFreeFire };
