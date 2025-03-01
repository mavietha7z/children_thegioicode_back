import { configCreateLog } from '~/configs';
import { Notification } from '~/models/notification';

const controlAuthGetNotifications = async (req, res) => {
    try {
        const { service } = req.query;

        if (!service || !['Web', 'Email'].includes(service)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Notification.countDocuments({ service });
        const pages = Math.ceil(count / pageSize);

        const results = await Notification.find({ service })
            .populate({ path: 'user_id', select: 'id full_name email' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                note,
                from,
                title,
                status,
                unread,
                service,
                content,
                sent_at,
                _id: key,
                created_at,
                updated_at,
                message_id,
                user_id: user,
                reason_failed,
            } = result;

            return {
                id,
                key,
                user,
                from,
                note,
                title,
                status,
                unread,
                service,
                content,
                sent_at,
                created_at,
                updated_at,
                message_id,
                reason_failed,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/notification/get.log', 'controlAuthGetNotifications', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetNotifications };
