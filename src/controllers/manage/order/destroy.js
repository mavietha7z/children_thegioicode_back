import { Order } from '~/models/order';
import { configCreateLog } from '~/configs';

const controlAuthDestroyOrder = async (req, res) => {
    try {
        const { id } = req.query;

        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({
                error: 'Không tìm thấy đơn hàng cần xoá',
            });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá đơn hàng #${order.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/order/destroy.log', 'controlAuthDestroyOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyOrder };
