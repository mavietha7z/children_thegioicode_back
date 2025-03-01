import { configCreateLog } from '~/configs';
import { CloudServerPlan } from '~/models/cloudServerPlan';

const controlAuthCreateCloudServerPlan = async (req, res) => {
    try {
        const { title, description, image_url } = req.body;

        const newPlan = await new CloudServerPlan({
            title,
            description,
            image_url,
        }).save();

        const data = {
            title,
            image_url,
            description,
            id: newPlan.id,
            key: newPlan._id,
            status: newPlan.status,
            created_at: Date.now(),
            updated_at: Date.now(),
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới máy chủ #${newPlan.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/plan/create.log', 'controlAuthCreateCloudServerPlan', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateCloudServerPlan };
