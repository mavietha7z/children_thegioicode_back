import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';

const controlV2CloudServerGetImages = async (req, res) => {
    try {
        const regions = await CloudServerImage.find({ status: true })
            .select('id title group priority image_url description')
            .sort({ priority: 1 });

        const data = regions.map((region) => {
            return {
                id: region.id,
                title: region.title,
                group: region.group,
                priority: region.priority,
                image_url: region.image_url,
                description: region.description,
            };
        });

        res.status(200).json({
            data,
            status: 200,
            message: 'Lấy danh sách hệ điều hành thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/image.log', 'controlV2CloudServerGetImages', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerGetImages };
