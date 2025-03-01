import slug from 'slug';
import { Api } from '~/models/api';
import { v4 as uuidv4 } from 'uuid';
import { User } from '~/models/user';
import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';

const controlAuthCreateApi = async (req, res) => {
    try {
        const { title, category, price, old_price, priority, version, status, image_url, free_usage, description } = req.body;

        const isApi = await Api.findOne({ category });
        if (isApi) {
            return res.status(400).json({ error: `API có category ${category} đã tồn tại` });
        }

        const slug_url = slug(title);

        const newApi = await new Api({
            title,
            category,
            description,
            slug_url,
            price,
            old_price,
            priority,
            image_url,
            status,
            free_usage,
            document_html: '',
            document_text: '',
            version,
            proxy: '',
            datadome: '',
            count_get_datadome: 0,
        }).save();

        const users = await User.find({}).select('id email full_name').sort({ created_at: -1 });
        for (const user of users) {
            await new Apikey({
                user_id: user._id,
                service_id: newApi._id,
                service_type: 'Api',
                free_usage,
                webhooks: {
                    url: [],
                    security_key: '',
                },
                key: `SV-${uuidv4()}`,
                category,
            }).save();
        }

        const data = {
            title,
            price,
            status,
            version,
            category,
            slug_url,
            priority,
            proxy: '',
            old_price,
            image_url,
            free_usage,
            description,
            datadome: '',
            id: newApi.id,
            key: newApi._id,
            count_get_datadome: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            requests: {
                error: 0,
                success: 0,
            },
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới API #${newApi.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/create.log', 'controlAuthCreateApi', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateApi };
