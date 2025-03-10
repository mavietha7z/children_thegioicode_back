import { configCreateLog } from '~/configs';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { servicePartnerGetRegions } from '~/services/partner/cloudServer';

const controlAuthAsyncCloudServerRegion = async (req, res) => {
    try {
        const result = await servicePartnerGetRegions();
        if (result.status !== 200) {
            return res.status(400).json({
                error: result.error,
            });
        }

        for (let i = 0; i < result.data.length; i++) {
            const region = result.data[i];

            const plans = region.plans.map((plan) => {
                return {
                    id: plan.id,
                    title: plan.title,
                    image_url: plan.image_url,
                    description: plan.description,
                };
            });

            const isRegion = await CloudServerRegion.findOne({ partner_id: region.id });
            if (!isRegion) {
                await new CloudServerRegion({
                    plans,
                    title: region.title,
                    partner_id: region.id,
                    priority: region.priority,
                    image_url: region.image_url,
                    description: region.description,
                }).save();
            } else {
                isRegion.plans = plans;
                isRegion.title = region.title;
                isRegion.updated_at = Date.now();
                isRegion.priority = region.priority;
                isRegion.image_url = region.image_url;
                isRegion.description = region.description;
                await isRegion.save();
            }
        }

        // Xoá những khu vực không có trong mảng trả về
        const existingRegions = await CloudServerRegion.find().select('partner_id');
        const existingRegionIds = existingRegions.map((region) => region.partner_id);

        const regionIds = result.data.map((region) => region.id);
        const regionsToDelete = existingRegionIds.filter((id) => !regionIds.includes(id));
        await CloudServerRegion.deleteMany({ partner_id: { $in: regionsToDelete } });

        res.status(200).json({
            status: 200,
            message: 'Đồng bộ khu vực máy chủ với đối tác thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/region/async.log', 'controlAuthAsyncCloudServerRegion', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthAsyncCloudServerRegion };
