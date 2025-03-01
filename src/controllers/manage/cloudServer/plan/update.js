import { configCreateLog } from '~/configs';
import { CloudServerPlan } from '~/models/cloudServerPlan';

const controlAuthUpdateCloudServerPlan = async (req, res) => {
    try {
        const { id, type } = req.query;

        if (!['info', 'status'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const plan = await CloudServerPlan.findById(id);
        if (!plan) {
            return res.status(404).json({ error: 'Cấu hình cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            plan.status = !plan.status;

            data = true;
            message = 'Bật/Tắt trạng máy chủ thành công';
        }

        if (type === 'info') {
            const { title, image_url, description } = req.body;

            plan.title = title;
            plan.image_url = image_url;
            plan.description = description;

            data = {
                title,
                key: id,
                image_url,
                description,
                id: plan.id,
                status: plan.status,
                updated_at: Date.now(),
                created_at: plan.created_at,
            };

            message = `Cập nhật máy chủ #${plan.id} thành công`;
        }

        plan.updated_at = Date.now();
        await plan.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/plan/update.log', 'controlAuthUpdateCloudServerPlan', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateCloudServerPlan };
