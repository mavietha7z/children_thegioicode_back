import { Api } from '~/models/api';
import { configCreateLog } from '~/configs';

const controlUserGetApis = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Api.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const apis = await Api.find({}).skip(skip).limit(pageSize).sort({ priority: 1 });

        const data = apis.map((api) => {
            return {
                title: api.title,
                price: api.price,
                status: api.status,
                priority: api.priority,
                slug_url: api.slug_url,
                old_price: api.old_price,
                image_url: api.image_url,
                description: api.description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/api/get.log', 'controlUserGetApis', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserGetApiBySlug = async (req, res) => {
    try {
        const { slug: slug_url } = req.params;
        if (!slug_url) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const api = await Api.findOne({ slug_url });
        if (!api) {
            return res.status(404).json({ error: 'API cần truy cập không tồn tại' });
        }

        const data = {
            title: api.title,
            version: api.version,
            image_url: api.image_url,
            description: api.description,
            document_html: api.document_html,
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/api/get.log', 'controlUserGetApiBySlug', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetApis, controlUserGetApiBySlug };
