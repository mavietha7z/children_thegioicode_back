import { configCreateLog } from '~/configs';
import { CloudServerRegion } from '~/models/cloudServerRegion';

const controlUserGetCloudServerRegions = async (req, res) => {
    try {
        const regions = await CloudServerRegion.find({ status: true })
            .select('id title image_url plans status')
            .populate({ path: 'plans', select: 'id title image_url description' })
            .sort({ priority: 1 });

        const data = regions.map((region) => {
            return {
                id: region.id,
                title: region.title,
                image_url: region.image_url,
                plans: region.plans.map((plan) => ({
                    id: plan.id,
                    title: plan.title,
                    image_url: plan.image_url,
                    description: plan.description,
                })),
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/cloudServer/region.log', 'controlUserGetCloudServerRegions', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetCloudServerRegions };
