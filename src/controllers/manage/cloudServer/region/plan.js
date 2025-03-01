import { configCreateLog } from '~/configs';
import { CloudServerPlan } from '~/models/cloudServerPlan';
import { CloudServerRegion } from '~/models/cloudServerRegion';

const controlAuthAddPlanToRegion = async (req, res) => {
    try {
        const { id, plan_id } = req.body;

        const isPlan = await CloudServerPlan.findById(plan_id);
        if (!isPlan) {
            return res.status(404).json({
                error: 'Plan cần thêm không tồn tại',
            });
        }

        const region = await CloudServerRegion.findById(id).populate({ path: 'plans', select: 'id title image_url' });
        if (!region) {
            return res.status(404).json({
                error: 'Khu vực cần thêm plan không tồn tại',
            });
        }

        const planIndex = region.plans.findIndex((plan) => plan._id.toString() === plan_id);
        if (planIndex !== -1) {
            return res.status(400).json({ error: 'Plan đã tồn tại trong khu vực này' });
        }

        const newPlans = [
            ...region.plans,
            {
                _id: isPlan._id,
                id: isPlan.id,
                title: isPlan.title,
                image_url: isPlan.image_url,
            },
        ];

        region.plans.push(plan_id);
        await region.save();

        const data = {
            key: id,
            id: region.id,
            plans: newPlans,
            title: region.title,
            status: region.status,
            priority: region.priority,
            image_url: region.image_url,
            created_at: region.created_at,
            updated_at: region.updated_at,
            description: region.description,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Thêm plan vào khu vực #${region.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/region/plan.log', 'controlAuthAddPlanToRegion', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthRemovePlanInRegion = async (req, res) => {
    try {
        const { id, plan_id } = req.body;

        const region = await CloudServerRegion.findById(id).populate({ path: 'plans', select: 'id title image_url' });
        if (!region) {
            return res.status(404).json({
                error: 'Khu vực cần thêm plan không tồn tại',
            });
        }

        const planIndex = region.plans.findIndex((plan) => plan._id.toString() === plan_id);
        if (planIndex === -1) {
            return res.status(400).json({ error: 'Plan không tồn tại trong khu vực này' });
        }

        region.plans.splice(planIndex, 1);
        await region.save();

        const data = {
            key: id,
            id: region.id,
            plans: region.plans,
            title: region.title,
            status: region.status,
            priority: region.priority,
            image_url: region.image_url,
            created_at: region.created_at,
            updated_at: region.updated_at,
            description: region.description,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Xoá plan khỏi khu vực #${region.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/region/plan.log', 'controlAuthAddPlanToRegion', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthAddPlanToRegion, controlAuthRemovePlanInRegion };
