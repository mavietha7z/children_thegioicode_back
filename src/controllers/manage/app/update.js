import { App } from '~/models/app';
import { configCreateLog } from '~/configs';

const controlAuthUpdateInfoApps = async (req, res) => {
    try {
        const { contacts, website_status, favicon_url, website_logo_url, backend_logo_url } = req.body;
        const { status, reason } = website_status;
        const {
            email,
            zalo_url,
            tiktok_url,
            twitter_url,
            website_url,
            youtube_url,
            facebook_url,
            phone_number,
            telegram_url,
            instagram_url,
        } = contacts;

        const app = await App.findOne({});
        if (!app) {
            return res.status(404).json({ error: 'Dữ liệu cấu hình không tồn tại' });
        }

        app.contacts.email = email;
        app.favicon_url = favicon_url;
        app.contacts.zalo_url = zalo_url;
        app.website_status.status = status;
        app.website_status.reason = reason;
        app.contacts.tiktok_url = tiktok_url;
        app.contacts.twitter_url = twitter_url;
        app.contacts.website_url = website_url;
        app.contacts.youtube_url = youtube_url;
        app.website_logo_url = website_logo_url;
        app.backend_logo_url = backend_logo_url;
        app.contacts.facebook_url = facebook_url;
        app.contacts.phone_number = phone_number;
        app.contacts.telegram_url = telegram_url;
        app.contacts.instagram_url = instagram_url;
        app.updated_at = Date.now();
        await app.save();

        res.status(200).json({
            status: 200,
            message: 'Cập nhật cấu hình thông tin thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/app/update.log', 'controlAuthUpdateInfoApps', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthUpdateConfigSendMail = async (req, res) => {
    try {
        const { partner, host, port, secure, email, password } = req.body;

        const app = await App.findOne({});
        if (!app) {
            return res.status(404).json({ error: 'Dữ liệu cấu hình không tồn tại' });
        }

        app.updated_at = Date.now();
        app.sendmail_config.host = host;
        app.sendmail_config.port = port;
        app.sendmail_config.email = email;
        app.sendmail_config.secure = secure;
        app.sendmail_config.partner = partner;
        app.sendmail_config.password = password;

        await app.save();

        res.status(200).json({
            status: 200,
            message: 'Cập nhật cấu hình gửi email thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/app/update.log', 'controlAuthUpdateConfigSendMail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateInfoApps, controlAuthUpdateConfigSendMail };
