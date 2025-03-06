import { Api } from '~/models/api';
import { Request } from '~/models/request';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';

const controlAuthGetApis = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Api.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const results = await Api.find(objectQuery).skip(skip).limit(pageSize).sort({ priority: 1 });

        const data = await Promise.all(
            results.map(async (result) => {
                const {
                    id,
                    title,
                    price,
                    status,
                    apikey,
                    version,
                    category,
                    _id: key,
                    slug_url,
                    priority,
                    image_url,
                    old_price,
                    created_at,
                    updated_at,
                    free_usage,
                    description,
                } = result;

                const success = await Request.countDocuments({ service_id: key, status: 200 });
                const error = await Request.countDocuments({ service_id: key, status: { $in: [400, 403, 500, 502] } });

                return {
                    id,
                    key,
                    title,
                    price,
                    status,
                    apikey,
                    version,
                    category,
                    slug_url,
                    priority,
                    old_price,
                    image_url,
                    created_at,
                    updated_at,
                    free_usage,
                    description,
                    requests: {
                        error,
                        success,
                    },
                };
            }),
        );

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/get.log', 'controlAuthGetApis', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetApis };
