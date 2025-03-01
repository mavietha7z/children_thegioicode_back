import { isNaN } from '~/validators';
import { configCreateLog } from '~/configs';
import { Notification } from '~/models/notification';

const controlUserGetNotifications = async (req, res) => {
    try {
        const { modun, page } = req.query;

        if (!modun || (modun !== 'quicks' && modun !== 'mucus')) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        if (modun === 'quicks') {
            const notifications = await Notification.find({ user_id: req.user.id, service: 'Web' })
                .select('user_id id title content unread')
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

            return res.status(200).json({
                data,
                status: 200,
            });
        }

        if (modun === 'mucus') {
            if (!page) {
                return res.status(400).json({
                    error: 'Tham số truy vấn không hợp lệ',
                });
            }

            const numberPage = Number(page);
            if (numberPage < 1 || typeof numberPage !== 'number' || isNaN(numberPage)) {
                return res.status(400).json({
                    error: 'Tham số truy vấn không hợp lệ',
                });
            }

            const pageSize = 15;
            const skip = (numberPage - 1) * pageSize;

            const count = await Notification.countDocuments({ user_id: req.user.id, service: 'Web' });
            const pages = Math.ceil(count / pageSize);

            const notifications = await Notification.find({ user_id: req.user.id, service: 'Web' })
                .select('id title content unread created_at')
                .skip(skip)
                .limit(pageSize)
                .sort({ created_at: -1 });

            const data = notifications.map((notification) => {
                return {
                    id: notification.id,
                    title: notification.title,
                    content: notification.content,
                    unread: notification.unread,
                    created_at: notification.created_at,
                };
            });

            return res.status(200).json({
                data,
                pages,
                status: 200,
            });
        }

        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    } catch (error) {
        configCreateLog('controllers/my/account/notification.log', 'controlUserGetNotifications', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserUnreadNotification = async (req, res) => {
    try {
        const { type, id } = req.body;

        if (!['one', 'all'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        if (type === 'one') {
            if (!id) {
                return res.status(400).json({ error: 'Gửi thông báo cần đánh dấu đã đọc' });
            }

            await Notification.updateOne({ id, service: 'Web' }, { $set: { unread: false }, updated_at: Date.now() });
        }
        if (type === 'all') {
            await Notification.updateMany({ user_id: req.user.id, service: 'Web' }, { $set: { unread: false }, updated_at: Date.now() });
        }

        res.status(200).json({
            data: true,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/account/notification.log', 'controlUserUnreadNotification', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetNotifications, controlUserUnreadNotification };
