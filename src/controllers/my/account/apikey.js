import { Api } from '~/models/api';
import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';

const controlUserGetApiKeys = async (req, res) => {
    try {
        const apiKeys = await Apikey.find({ user_id: req.user.id }).sort({ created_at: -1 });

        const data = await Promise.all(
            apiKeys.map(async (apiKey) => {
                const checkApi = await Api.findOne({ category: apiKey.category }).select('title');

                return {
                    used: apiKey.used,
                    api_key: apiKey.key,
                    status: apiKey.status,
                    category: checkApi.title,
                    webhooks: apiKey.webhooks,
                    free_usage: apiKey.free_usage,
                    created_at: apiKey.created_at,
                };
            }),
        );

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/account/apikey.log', 'controlUserGetApiKeys', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserUpdateApiKey = async (req, res) => {
    try {
        const { action } = req.query;
        const { url, api_key, security_key } = req.body;

        const apikey = await Apikey.findOne({ key: api_key });
        if (!apikey) {
            return res.status(404).json({
                error: 'Apikey dịch vụ không tồn tại',
            });
        }

        let data = null;
        let message = '';
        if (action === 'destroy') {
            const webhooks = {
                url: [],
                security_key: '',
            };

            apikey.webhooks = webhooks;

            message = 'Xoá cấu hình api thành công';
        }

        if (action === 'config') {
            if (url.length < 1) {
                return res.status(400).json({
                    error: 'Cần tối thiểu 1 tên miền sử dụng',
                });
            }

            const webhooks = {
                url,
                security_key,
            };

            apikey.webhooks = webhooks;

            message = 'Thêm cấu hình api thành công';
        }

        apikey.updated_at = Date.now();
        await apikey.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/account/apikey.log', 'controlUserUpdateApiKey', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetApiKeys, controlUserUpdateApiKey };
