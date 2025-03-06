import { Player } from '~/models/player';
import { configCreateLog } from '~/configs';
import { controlCreatePlayer } from '../manage/api/player';
import { controlCreateRequest } from '../manage/api/request';
import { serviceFetchLoginFreeFire } from '~/services/v2/freefire';

const controlV2LoginFreeFire = async (req, res) => {
    const { account_id } = req.body;
    const { _id: service_id } = req.currentApi;

    let status = null;
    let response = null;
    let accounts = null;
    let requests = null;
    try {
        const data = {
            account_id,
        };

        const result = await serviceFetchLoginFreeFire(`${req.partner.url}/api/v2/player_id_login`, data, req.currentApi.apikey.key);

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
