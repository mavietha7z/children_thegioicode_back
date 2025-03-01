import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';

const controlAuthUpdateCloudServerImage = async (req, res) => {
    try {
        const { id, type } = req.query;

        if (!['status', 'info'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const image = await CloudServerImage.findById(id);
        if (!image) {
            return res.status(404).json({ error: 'Hệ điều hành cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            image.status = !image.status;

            data = true;
            message = 'Bật/Tắt trạng thái hệ điều hành thành công';
        }

        if (type === 'info') {
            const { title, group, code, priority, description, image_url } = req.body;

            image.title = title;
            image.group = group;
            image.code = code;
            image.priority = priority;
            image.image_url = image_url;
            image.description = description;

            data = {
                code,
                title,
                group,
                key: id,
                priority,
                image_url,
                description,
                id: image.id,
                status: image.status,
                updated_at: Date.now(),
                created_at: image.created_at,
            };

            message = `Cập nhật khu vực #${image.id} thành công`;
        }

        image.updated_at = Date.now();
        await image.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/image/update.log', 'controlAuthUpdateCloudServerImage', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateCloudServerImage };
