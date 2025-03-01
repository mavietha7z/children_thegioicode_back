import { App } from '~/models/app';
import { configCreateLog } from '~/configs';
import { sendEmailNotification } from '~/email';
import { Notification } from '~/models/notification';

const SAFE_INTERVAL = 10000;

const serviceCronSendMail = async () => {
    try {
        const sentEmail = await Notification.findOne({ service: 'Email', status: 'sent' }).sort({ sent_at: -1 });
        if (sentEmail) {
            const timeDiff = new Date() - new Date(sentEmail.sent_at);

            if (timeDiff < SAFE_INTERVAL) {
                return;
            }
        }

        const email = await Notification.findOne({ service: 'Email', status: 'pending' })
            .populate({ path: 'user_id', select: 'id email full_name' })
            .sort({ created_at: 1 });
        if (!email) {
            return;
        }

        const { sendmail_config } = await App.findOne({}).select('sendmail_config');
        if (!sendmail_config) {
            return;
        }

        const result = await sendEmailNotification(
            sendmail_config.host,
            sendmail_config.port,
            sendmail_config.secure,
            sendmail_config.email,
            sendmail_config.password,
            email.user_id.email,
            email.title,
            email.content,
            email.note,
        );

        if (result) {
            email.status = 'sent';
            email.sent_at = Date.now();
            email.updated_at = Date.now();
            email.message_id = result.messageId;
        } else {
            email.status = 'failed';
            email.updated_at = Date.now();
            email.reason_failed = `Gửi email thất bại với ${sendmail_config.partner}`;
        }

        await email.save();
    } catch (error) {
        configCreateLog('services/cron/sendmail.log', 'serviceCronSendMail', error.message);
    }
};

export { serviceCronSendMail };
