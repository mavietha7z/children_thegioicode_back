import { configCreateLog } from '~/configs';
import { OrderTemplate } from '~/models/orderTemplate';

const controlUserUsingGetOrderTemplates = async (req, res) => {
    try {
        const orders = await OrderTemplate.find({ user_id: req.user.id })
            .select('id app_domain status created_at expired_at')
            .limit(5)
            .sort({ created_at: -1 });

        const data = orders.map((order) => {
            return {
                id: order.id,
                service: 'templates',
                status: order.status,
                title: order.app_domain,
                created_at: order.created_at,
                expired_at: order.expired_at,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/using/template.log', 'controlUserUsingGetOrderTemplates', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserUsingGetOrderTemplates };
