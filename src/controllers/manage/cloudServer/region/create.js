import { configCreateLog } from '~/configs';
import { CloudServerRegion } from '~/models/cloudServerRegion';

const controlAuthCreateCloudServerRegion = async (req, res) => {
    try {
        const { title, image_url, priority, description } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Tên khu vực không được để trống' });
        }
        if (!image_url) {
            return res.status(400).json({ error: 'Ảnh đại diện không được để trống' });
        }
        if (!priority) {
            return res.status(400).json({ error: 'Độ ưu tiên không được để trống' });
        }

        const newRegion = await new CloudServerRegion({
            title,
            priority,
            image_url,
            description,
        }).save();

        const data = {
            title,
            priority,
            image_url,
            description,
            status: true,
            id: newRegion.id,
            key: newRegion._id,
            created_at: Date.now(),
            updated_at: Date.now(),
            plans: newRegion.plans,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới khu vực #${newRegion.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/region/create.log', 'controlAuthCreateCloudServerRegion', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateCloudServerRegion };
