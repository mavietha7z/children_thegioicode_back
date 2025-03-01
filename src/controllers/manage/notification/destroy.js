import { configCreateLog } from '~/configs';
import { Notification } from '~/models/notification';

const controlAuthDestroyNotification = async (req, res) => {
    try {
        const { id } = req.query;

        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) {
            return res.status(404).json({ error: 'Thông báo cần xoá không tồn tại' });
        }

        res.status(200).json({
            status: 200,
            message: `Xóa thông báo #${notification.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/notification/destroy.log', 'controlAuthDestroyNotification', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyNotification };
