import { configCreateLog } from '~/configs';
import { CloudServerRegion } from '~/models/cloudServerRegion';

const controlV2CloudServerGetRegions = async (req, res) => {
    try {
        const regions = await CloudServerRegion.find({ status: true })
            .select('id title priority image_url description plans')
            .populate({ path: 'plans', select: 'id title image_url description' })
            .sort({ priority: 1 });

        const data = regions.map((region) => {
            return {
                id: region.id,
                title: region.title,
                priority: region.priority,
                image_url: region.image_url,
                description: region.description,
                plans: region.plans.map((plan) => {
                    return {
                        id: plan.id,
                        title: plan.title,
                        image_url: plan.image_url,
                        description: plan.description,
                    };
                }),
            };
        });

        res.status(200).json({
            data,
            status: 200,
            message: 'Lấy danh sách vị trí đặt máy chủ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/region.log', 'controlV2CloudServerGetRegions', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerGetRegions };
