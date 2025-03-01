import { configCreateLog } from '~/configs';
import { OrderCloudServer } from '~/models/orderCloudServer';

const controlUserUsingGetOrderInstances = async (req, res) => {
    try {
        const orders = await OrderCloudServer.find({ user_id: req.user.id })
            .select('id display_name status created_at expired_at')
            .limit(5)
            .sort({ created_at: -1 });

        const data = orders.map((order) => {
            return {
                id: order.id,
                service: 'instances',
                status: order.status,
                title: order.display_name,
                created_at: order.created_at,
                expired_at: order.expired_at,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/using/instance.log', 'controlUserUsingGetOrderInstances', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserUsingGetOrderInstances };
