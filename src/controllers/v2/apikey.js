import { Api } from '~/models/api';
import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';

const controlV2GetInfoApiKeys = async (req, res) => {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'error_require_apikey',
            });
        }

        const key = authorization.split(' ')[1];

        const apikey = await Apikey.findOne({ key });
        if (!apikey) {
            return res.status(404).json({
                error: 'Apikey dịch vụ không tồn tại',
            });
        }

        const api = await Api.findOne({ category: apikey.category }).select('title price');
        if (!api) {
            return res.status(404).json({
                error: 'Dịch vụ của apikey này không tồn tại',
            });
        }

        const data = {
            use: apikey.use,
            price: api.price,
            apikey: apikey.key,
            category: api.title,
            status: apikey.status,
            free_usage: apikey.free_usage,
            expired_at: '31-12-9999 23:59:59',
        };

        res.status(200).json({
            data,
            status: 200,
            message: 'Lấy thông tin apikey thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/apikey.log', 'controlV2GetInfoApiKeys', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2GetInfoApiKeys };
