import { Api } from '~/models/api';
import { Request } from '~/models/request';
import { configCreateLog } from '~/configs';

const controlAuthUpdateApi = async (req, res) => {
    try {
        const { id: service_id } = req.query;
        const { title, price, status, version, slug_url, priority, old_price, free_usage, description } = req.body;

        const result = await Api.findById(service_id);
        if (!result) {
            return res.status(404).json({ error: 'API cần cập nhật không tồn tại' });
        }

        result.title = title;
        result.price = price;
        result.status = status;
        result.version = version;
        result.slug_url = slug_url;
        result.priority = priority;
        result.old_price = old_price;
        result.free_usage = free_usage;
        result.updated_at = Date.now();
        result.description = description;
        await result.save();

        const success = await Request.countDocuments({ service_id, status: 200 });
        const error = await Request.countDocuments({ service_id, status: { $in: [400, 403, 500, 502] } });

        const data = {
            title,
            price,
            status,
            version,
            slug_url,
            priority,
            old_price,
            free_usage,
            description,
            id: result.id,
            key: service_id,
            apikey: result.apikey,
            updated_at: Date.now(),
            category: result.category,
            image_url: result.image_url,
            created_at: result.created_at,
            requests: {
                error,
                success,
            },
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Cập nhật API #${result.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/update.log', 'controlAuthUpdateApi', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateApi };
