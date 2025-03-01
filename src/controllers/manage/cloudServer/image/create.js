import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';

const controlAuthCreateCloudServerImage = async (req, res) => {
    try {
        const { title, group, code, priority, description, image_url } = req.body;

        if (!title || !group || !code || !priority || !image_url) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const isImage = await CloudServerImage.findOne({ code });
        if (isImage) {
            return res.status(400).json({ error: 'Mã hệ điều hành đã tồn tại' });
        }

        const newImage = await new CloudServerImage({
            code,
            title,
            group,
            priority,
            description,
            image_url,
        }).save();

        const data = {
            code,
            title,
            group,
            priority,
            image_url,
            id: newImage.id,
            key: newImage._id,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: newImage.status,
            description: newImage.description,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Thêm mới hệ điều hành #${newImage.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/image/create.log', 'controlAuthCreateCloudServerImage', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateCloudServerImage };
