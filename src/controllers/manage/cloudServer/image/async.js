import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';
import { servicePartnerGetImages } from '~/services/partner/cloudServer';

const controlAuthAsyncCloudServerImage = async (req, res) => {
    try {
        const result = await servicePartnerGetImages();
        if (result.status !== 200) {
            return res.status(400).json({
                error: result.error,
            });
        }

        for (let i = 0; i < result.data.length; i++) {
            const image = result.data[i];

            const isImage = await CloudServerImage.findOne({ partner_id: image.id });
            if (!isImage) {
                await new CloudServerImage({
                    title: image.title,
                    partner_id: image.id,
                    group: image.group,
                    priority: image.priority,
                    image_url: image.image_url,
                    description: image.description,
                }).save();
            } else {
                isImage.title = image.title;
                isImage.updated_at = Date.now();
                isImage.group = image.group;
                isImage.priority = image.priority;
                isImage.image_url = image.image_url;
                isImage.description = image.description;
                await isImage.save();
            }
        }

        // Xóa các image không có trong mảng trả về
        const partnerImageIds = result.data.map((image) => image.id);
        await CloudServerImage.deleteMany({ partner_id: { $nin: partnerImageIds } });

        res.status(200).json({
            status: 200,
            message: 'Đồng bộ hệ điều hành với đối tác thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/image/async.log', 'controlAuthAsyncCloudServerImage', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthAsyncCloudServerImage };
