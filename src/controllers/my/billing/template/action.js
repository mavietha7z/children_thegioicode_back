import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderTemplate } from '~/models/orderTemplate';

const controlUserBillingActionTemplate = async (req, res) => {
    try {
        const { action, template_id } = req.params;

        if (!action || action !== 'auto-renew' || !isValidDataId(template_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const template = await OrderTemplate.findOne({ user_id: req.user.id, id: template_id }).populate({
            path: 'template_id',
            select: 'id title',
        });

        if (!template) {
            return res.status(404).json({
                error: `Đơn hàng #${template_id} không tồn tại`,
            });
        }

        let data = null;
        let message = '';
        if (action === 'auto-renew') {
            template.auto_renew = !template.auto_renew;

            data = template.auto_renew;
            message = `Bật/Tắt tự động gia hạn đơn hàng #${template_id} thành công`;
        }

        template.updated_at = Date.now();
        await template.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/template/action.log', 'controlUserBillingActionTemplate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserBillingActionTemplate };
