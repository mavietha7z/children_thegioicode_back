import { App } from '~/models/app';
import nodemailer from 'nodemailer';
import contentSendEmail from './content';
import { configCreateLog } from '~/configs';

const sendEmailNotification = async (host, port, secure, user, pass, email, subject, content, note) => {
    try {
        const app = await App.findOne({}).select('favicon_url');

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
        });

        const contentMail = contentSendEmail(email, content, note, app.favicon_url);

        const result = await transporter.sendMail({
            from: `"Thegioicode" <${user}>`,
            to: email,
            subject,
            html: contentMail,
        });

        return result;
    } catch (error) {
        configCreateLog('email/index.log', 'sendEmailNotification', error.message);
        return false;
    }
};

export { sendEmailNotification };
