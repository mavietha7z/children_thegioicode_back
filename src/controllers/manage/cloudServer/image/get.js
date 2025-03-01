import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';

const controlAuthGetCloudServerImages = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await CloudServerImage.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const images = await CloudServerImage.find({}).skip(skip).limit(pageSize).sort({ group: 1 });

        const data = images.map((image) => {
            return {
                id: image.id,
                key: image._id,
                code: image.code,
                title: image.title,
                group: image.group,
                status: image.status,
                priority: image.priority,
                image_url: image.image_url,
                created_at: image.created_at,
                updated_at: image.updated_at,
                description: image.description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/image/get.log', 'controlAuthGetCloudServerImages', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCloudServerImages };
