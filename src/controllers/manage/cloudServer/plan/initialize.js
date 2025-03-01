import { configCreateLog } from '~/configs';
import { CloudServerPlan } from '~/models/cloudServerPlan';

const controlAuthInitializeCloudServerPlans = async (req, res) => {
    try {
        const plans = await CloudServerPlan.find({}).select('title').sort({ created_at: -1 });

        const data = plans.map((plan) => {
            const { _id, title } = plan;

            return {
                id: _id,
                title,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/plan/initialize.log', 'controlAuthInitializeCloudServerPlans', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthInitializeCloudServerPlans };
