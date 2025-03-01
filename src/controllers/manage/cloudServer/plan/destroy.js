import { configCreateLog } from '~/configs';
import { CloudServerPlan } from '~/models/cloudServerPlan';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlAuthDestroyCloudServerPlan = async (req, res) => {
    try {
        const { id } = req.query;

        const plan = await CloudServerPlan.findByIdAndDelete(id);
        if (!plan) {
            return res.status(404).json({
                error: 'Máy chủ cần xoá không tồn tại',
            });
        }

        await CloudServerProduct.deleteMany({ plan_id: id });

        const region = await CloudServerRegion.findOne({ plans: id });

        if (region) {
            region.plans = region.plans.filter((planId) => planId.toString() !== id);
            await region.save();
        }

        res.status(200).json({
            status: 200,
            message: `Xoá máy chủ #${plan.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/plan/destroy.log', 'controlAuthDestroyCloudServerPlan', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCloudServerPlan };
