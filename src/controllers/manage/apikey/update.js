import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';

const controlAuthUpdateApikey = async (req, res) => {
    try {
        const { type, id } = req.query;

        const apikey = await Apikey.findById(id)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'service_id', select: 'id title' });
        if (!apikey) {
            return res.status(404).json({
                error: 'Apikey cần cập nhật không tồn tại',
            });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            apikey.status = !apikey.status;

            data = true;
            message = 'Bật/Tắt trạng thái apikey thành công';
        }
        if (type === 'info') {
            const { free_usage, used } = req.body;

            apikey.used = used;
            apikey.free_usage = free_usage;

            data = {
                used,
                free_usage,
                id: apikey.id,
                key: apikey._id,
                apikey: apikey.key,
                user: apikey.user_id,
                status: apikey.status,
                webhooks: apikey.webhooks,
                service: apikey.service_id,
                category: apikey.category,
                created_at: apikey.created_at,
                updated_at: apikey.updated_at,
                service_type: apikey.service_type,
            };
            message = `Cập nhật apikey #${apikey.id} thành công`;
        }

        apikey.updated_at = Date.now();
        await apikey.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/apikey/update.log', 'controlAuthUpdateApikey', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateApikey };
