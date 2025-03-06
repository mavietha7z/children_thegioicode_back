import { Api } from '~/models/api';
import { Request } from '~/models/request';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';

const controlCreateRequest = async (requests) => {
    try {
        const { req, user_id, status, response, service_id } = requests;
        const { method, path, headers, body, params, query } = req;

        const newRequest = await new Request({
            user_id,
            service_id,
            method,
            path,
            headers,
            params,
            query,
            body,
            status,
            response,
        }).save();

        return newRequest;
    } catch (error) {
        configCreateLog('controllers/manage/api/request.log', 'controlCreateRequest', error.message);
        return null;
    }
};

const controlGetApisRequests = async (req, res) => {
    try {
        const { type, id, service_id } = req.query;

        if (type === 'detail' && isValidMongoId(id)) {
            const data = await Request.findById(id).select('-_id headers params query body response');

            return res.status(200).json({
                status: 200,
                data,
            });
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Request.countDocuments({ service_id });
        const pages = Math.ceil(count / pageSize);

        const serviceApi = await Api.findById(service_id).select('title');

        const requests = await Request.find({ service_id })
            .populate({ path: 'user_id', select: 'id full_name email' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = requests.map((request) => {
            const { _id: key, user_id: user, method, path, status, created_at, updated_at } = request;

            return {
                key,
                user,
                path,
                method,
                status,
                created_at,
                updated_at,
            };
        });

        return res.status(200).json({
            data,
            pages,
            status: 200,
            service: serviceApi.title,
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/request.log', 'controlGetApisRequests', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlCreateRequest, controlGetApisRequests };
