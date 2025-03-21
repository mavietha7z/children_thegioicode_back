import { Player } from '~/models/player';
import { configCreateLog } from '~/configs';
import { controlCreatePlayer } from '../manage/api/player';
import { controlCreateRequest } from '../manage/api/request';
import { serviceFetchLoginGarena } from '~/services/v2/garena';

const controlV2CheckGarenaLogin = async (req, res) => {
    const { username, password } = req.body;
    const { _id: service_id } = req.currentApi;

    let status = null;
    let response = null;
    let accounts = null;
    let requests = null;
    try {
        const data = {
            username,
            password,
        };

        const result = await serviceFetchLoginGarena(`${req.partner.url}/api/v2/garena_login`, data, req.currentApi.apikey.key);

        if (result.success) {
            accounts = {
                username,
                password,
                service_id,
                id: result.data.id,
                uid: result.data.uid,
                timestamp: result.data.timestamp,
                session_key: result.data.session_key,
            };
            status = 200;
            response = {
                status,
                data: {
                    username,
                    id: result.data.id,
                    uid: result.data.uid,
                    timestamp: result.data.timestamp,
                    session_key: result.data.session_key,
                },
            };
            requests = {
                req,
                status,
                response,
                service_id,
                user_id: req.user._id,
            };
        } else {
            const garena = await Player.findOne({ 'account_garena.username': username });

            if (garena && garena.account_garena.password !== password) {
                status = 200;
                response = { error: 'Mật khẩu tài khoản bị sai' };
                requests = {
                    req,
                    status,
                    response,
                    service_id,
                    user_id: req.user._id,
                };
            } else if (garena && garena.account_garena.password === password) {
                status = 200;
                response = {
                    status,
                    data: {
                        username,
                        id: garena.account_garena.id,
                        uid: garena.account_garena.uid,
                        timestamp: garena.account_garena.timestamp,
                        session_key: garena.account_garena.session_key,
                    },
                };
                requests = {
                    req,
                    status,
                    response,
                    service_id,
                    user_id: req.user._id,
                };
            } else {
                status = result.status;
                response = { error: result.error };
                requests = {
                    req,
                    status,
                    response,
                    service_id,
                    user_id: req.user._id,
                };
            }
        }
    } catch (error) {
        status = 500;
        response = { error: 'Đã xảy ra lỗi khi gửi yêu cầu' };

        configCreateLog('controllers/v2/garena.log', 'controlV2CheckGarenaLogin', error.message);
    } finally {
        if (accounts) {
            await controlCreatePlayer(accounts, 'garena');
        }
        if (requests) {
            await controlCreateRequest(requests);
        }
        res.status(status).json(response);
    }
};

export { controlV2CheckGarenaLogin };
