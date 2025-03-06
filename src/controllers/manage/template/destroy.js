import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { Template } from '~/models/template';
import { OrderTemplate } from '~/models/orderTemplate';
import { serviceAuthRemoveDomainFromCloudflare } from '~/services/my/template/payment';

const controlAuthDestroyTemplate = async (req, res) => {
    try {
        const { id: service_id } = req.query;

        const template = await Template.findByIdAndDelete(service_id);
        if (!template) {
            return res.status(404).json({ error: 'Template cần xoá không tồn tại' });
        }

        await OrderTemplate.deleteMany({ template_id: service_id });
        await Pricing.deleteMany({ service_id, service_type: 'Template' });

        res.status(200).json({
            status: 200,
            message: `Xoá template #${template.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/template/destroy.log', 'controlAuthDestroyTemplate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthDestroyOrderTemplate = async (req, res) => {
    try {
        const { id } = req.query;

        const order = await OrderTemplate.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Đơn tạo website không tồn tại' });
        }

        const currentTime = new Date();
        const expirationTime = new Date(order.expired_at);

        if (currentTime < expirationTime) {
            return res.status(400).json({ error: 'Thời gian sử dụng chưa hết không thể xoá' });
        }

        await serviceAuthRemoveDomainFromCloudflare(order.cloudflare.id);

        await order.deleteOne();

        res.status(200).json({
            status: 200,
            message: `Xoá đơn tạo website #${order.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/template/destroy.log', 'controlAuthDestroyOrderTemplate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyTemplate, controlAuthDestroyOrderTemplate };
