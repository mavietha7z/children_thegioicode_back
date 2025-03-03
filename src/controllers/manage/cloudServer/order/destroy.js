import { configCreateLog } from '~/configs';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerPartner } from '~/models/partner';
import { serviceAuthDeleteVPS } from '~/services/partner/cloudServer';

const controlAuthDestroyCloudServerOrder = async (req, res) => {
    try {
        const { id } = req.query;

        const order = await OrderCloudServer.findById(id);
        if (!order) {
            return res.status(404).json({
                error: 'Đơn máy chủ cần xoá không tồn tại',
            });
        }

        const partner = await CloudServerPartner.findOne({}).select('url key password');
        if (!partner) {
            return res.status(404).json({
                error: 'Đối tác máy chủ không tồn tại',
            });
        }

        await order.deleteOne();
        serviceAuthDeleteVPS(partner.url, partner.key, partner.password, order.order_info.order_id);

        res.status(200).json({
            status: 200,
            message: `Xoá đơn máy chủ #${order.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/order/destroy.log', 'controlAuthDestroyCloudServerOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCloudServerOrder };
