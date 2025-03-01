import { configCreateLog } from '~/configs';
import { Notification } from '~/models/notification';

const controlAuthGetCurrentNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.user.id, service: 'Web' })
            .select('id title content unread')
            .limit(10)
            .sort({ created_at: -1 });

        const data = notifications.map((notification) => {
            return {
                id: notification.id,
                title: notification.title,
                content: notification.content,
                unread: notification.unread,
            };
        });

        res.status(200).json({
            status: 200,
            data,
        });
    } catch (error) {
        configCreateLog('controllers/manage/auth/notification.log', 'controlAuthGetCurrentNotifications', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCurrentNotifications };
