import { configCreateLog } from '~/configs';
import { CloudServerRegion } from '~/models/cloudServerRegion';

const controlAuthUpdateCloudServerRegion = async (req, res) => {
    try {
        const { id, type } = req.query;

        if (!['status', 'info'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const region = await CloudServerRegion.findById(id);
        if (!region) {
            return res.status(404).json({ error: 'Khu vực cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            region.status = !region.status;

            data = true;
            message = 'Bật/Tắt trạng thái khu vực thành công';
        }

        if (type === 'info') {
            const { title, image_url, priority, description } = req.body;

            region.title = title;
            region.priority = priority;
            region.image_url = image_url;
            region.description = description;

            data = {
                title,
                key: id,
                priority,
                image_url,
                description,
                id: region.id,
                plans: region.plans,
                status: region.status,
                updated_at: Date.now(),
                created_at: region.created_at,
            };

            message = `Cập nhật khu vực #${region.id} thành công`;
        }

        region.updated_at = Date.now();
        await region.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/region/update.log', 'controlAuthUpdateCloudServerRegion', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateCloudServerRegion };
