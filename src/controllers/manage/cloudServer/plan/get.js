import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { CloudServerPlan } from '~/models/cloudServerPlan';

const controlAuthGetCloudServerPlans = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await CloudServerPlan.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const plans = await CloudServerPlan.find(objectQuery).skip(skip).limit(pageSize).sort({ created_at: -1 });

        const data = plans.map((plan) => {
            const { id, _id: key, title, image_url, status, description, created_at, updated_at } = plan;

            return {
                id,
                key,
                title,
                status,
                image_url,
                created_at,
                updated_at,
                description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/plan/get.log', 'controlAuthGetCloudServerPlans', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCloudServerPlans };
