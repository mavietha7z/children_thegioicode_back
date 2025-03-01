import { App } from '~/models/app';
import { configCreateLog } from '~/configs';

const controlUserGetConfigApps = async (req, res) => {
    try {
        const app = await App.findOne({});
        if (!app) {
            return res.status(404).json({ error: 'Cấu hình website đang bảo trì' });
        }

        const data = {
            contacts: {
                email: app.contacts.email,
                zalo_url: app.contacts.zalo_url,
                website_url: app.contacts.website_url,
                phone_number: app.contacts.phone_number,
                telegram_url: app.contacts.telegram_url,
            },
            favicon_url: app.favicon_url,
            website_status: app.website_status,
            website_status: app.website_status,
            website_logo_url: app.website_logo_url,
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/app/get.log', 'controlUserGetConfigApps', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetConfigApps };
