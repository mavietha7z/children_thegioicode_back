import { App } from '~/models/app';
import { configCreateLog } from '~/configs';

const controlAuthGetInfoApps = async (req, res) => {
    try {
        const app = await App.findOne({});

        const data = {
            contacts: app.contacts,
            favicon_url: app.favicon_url,
            website_status: app.website_status,
            website_logo_url: app.website_logo_url,
            backend_logo_url: app.backend_logo_url,
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/app/get.log', 'controlAuthGetInfoApps', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthGetConfigSendMail = async (req, res) => {
    try {
        const { sendmail_config } = await App.findOne({}).select('sendmail_config');

        const data = {
            host: sendmail_config.host,
            port: sendmail_config.port,
            email: sendmail_config.email,
            secure: sendmail_config.secure,
            partner: sendmail_config.partner,
            password: sendmail_config.password,
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/app/get.log', 'controlAuthGetConfigSendMail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetInfoApps, controlAuthGetConfigSendMail };
