import { App } from '~/models/app';
import { configCreateLog } from '~/configs';
import { sendMessageBotTelegramError } from '~/bot';
import { Notification } from '~/models/notification';

const serviceCreateNotificationUser = async (user_id, service, title, content, note = null) => {
    try {
        let from = null;
        let status = 'sent';
        let sent_at = Date.now();
        if (service === 'Email') {
            const { sendmail_config } = await App.findOne({}).select('sendmail_config');
            if (!sendmail_config) {
                throw new Error('Không tìm thấy cấu hình gửi email');
            }

            sent_at = null;
            status = 'pending';
            from = sendmail_config.partner;
        }

        await new Notification({
            from,
            note,
            title,
            status,
            user_id,
            service,
            content,
            sent_at,
        }).save();

        return true;
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi tạo thông báo người dùng: \n\n ${error.message}`);
        configCreateLog('services/user/notification.log', 'serviceCreateNotificationUser', error.message);
        return false;
    }
};

export { serviceCreateNotificationUser };
