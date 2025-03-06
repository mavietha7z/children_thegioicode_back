import { configCreateLog } from '~/configs';
import { controlCreatePlayer } from '../manage/api/player';
import { controlCreateRequest } from '../manage/api/request';
import { serviceFetchLoginVngGames } from '~/services/v2/vnggames';

const controlV2LoginVngGames = async (req, res) => {
    const { _id: service_id } = req.currentApi;
    const { module, role_id, front_id } = req.body;

    let status = null;
    let response = null;
    let accounts = null;
    let requests = null;
    try {
        const data = {
            module,
            role_id,
            front_id,
        };

        const result = await serviceFetchLoginVngGames(`${req.partner.url}/api/v2/vnggames_login`, data, req.currentApi.apikey.key);

        if (result.success) {
            accounts = {
                user_id: result.data.user_id,
                login_type: result.data.login_type,
                jwt_token: result.data.jwt_token,
                server_id: result.data.server_id,
                server_name: result.data.server_name,
                role_id,
                role_name: result.data.role_name,
                front_id,
                module,
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
    } catch (error) {
        status = 500;
        response = { error: 'Đã xảy ra lỗi khi gửi yêu cầu' };

        configCreateLog('controllers/v2/vnggames.log', 'controlV2LoginVngGames', error.message);
    } finally {
        if (accounts) {
            await controlCreatePlayer(accounts, 'vnggames');
        }
        if (requests) {
            await controlCreateRequest(requests);
        }

        res.status(status).json(response);
    }
};

export { controlV2LoginVngGames };
