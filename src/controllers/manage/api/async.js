import { Api } from '~/models/api';
import { configCreateLog } from '~/configs';
import { servicePartnerGetPublicApis } from '~/services/partner/api';

const controlAuthAsyncPublicApi = async (req, res) => {
    try {
        const result = await servicePartnerGetPublicApis();

        if (result.status !== 200) {
            return res.status(400).json({
                error: result.error,
            });
        }

        for (let i = 0; i < result.data.length; i++) {
            const api = result.data[i];

            const isAPI = await Api.findOne({ partner_id: api.id });

            if (!isAPI) {
                await new Api({
                    title: api.title,
                    price: api.price,
                    partner_id: api.id,
                    status: api.status,
                    version: api.version,
                    category: api.category,
                    slug_url: api.slug_url,
                    priority: api.priority,
                    old_price: api.old_price,
                    image_url: api.image_url,
                    free_usage: api.free_usage,
                    description: api.description,
                    document_html: api.document_html,
                    document_text: api.document_text,
                    apikey: {
                        key: api.apikey.key,
                        used: api.apikey.used,
                        status: api.apikey.status,
                        free_usage: api.apikey.free_usage,
                    },
                }).save();
            } else {
                isAPI.title = api.title;
                isAPI.price = api.price;
                isAPI.status = api.status;
                isAPI.version = api.version;
                isAPI.updated_at = Date.now();
                isAPI.priority = api.priority;
                isAPI.category = api.category;
                isAPI.slug_url = api.slug_url;
                isAPI.old_price = api.old_price;
                isAPI.image_url = api.image_url;
                isAPI.free_usage = api.free_usage;
                isAPI.description = api.description;
                isAPI.document_html = api.document_html;
                isAPI.document_text = api.document_text;
                isAPI.apikey = {
                    key: api.apikey.key,
                    used: api.apikey.used,
                    status: api.apikey.status,
                    free_usage: api.apikey.free_usage,
                };
                await isAPI.save();
            }
        }

        res.status(200).json({
            status: 200,
            message: 'Đồng bộ public api với đối tác thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/async.log', 'controlAuthAsyncPublicApi', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthAsyncPublicApi };
