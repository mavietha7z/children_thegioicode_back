import fs from 'fs';
import path from 'path';
import moment from 'moment';
import archiver from 'archiver';
import { App } from '~/models/app';
import nodemailer from 'nodemailer';
import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import contentSendEmail from '~/email/content';
import { serviceFetchExportDatabase, serviceModelMapDatabase } from '../manage/database/export';

const OPTIONS = [
    'ApiKeys',
    'Apis',
    'Apps',
    'BonusPoints',
    'CartProducts',
    'Carts',
    'CloudServerImages',
    'CloudServerPartners',
    'CloudServerPlans',
    'CloudServerProducts',
    'CloudServerRegions',
    'Cycles',
    'Invoices',
    'Localbanks',
    'LoginHistories',
    'Memberships',
    'Notifications',
    'OrderCloudServers',
    'Orders',
    'OrderTemplates',
    'Paygates',
    'Players',
    'Pricings',
    'Requests',
    'ResourceAccounts',
    'ResourceCategories',
    'Sources',
    'Templates',
    'Tokens',
    'Userbanks',
    'Users',
    'WalletHistories',
    'Wallets',
];

const serviceCronBackupDatabase = async () => {
    try {
        // Tạo folder backup với định dạng yyyy-mm-dd-HH-ss
        const timestamp = moment(new Date()).format('YYYY-MM-DD-HH-mm');
        const backupDir = path.resolve(`./src/files/backup/netcode_${timestamp}`);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        for (const collection of OPTIONS) {
            if (serviceModelMapDatabase[collection]) {
                const { model, type } = serviceModelMapDatabase[collection];
                const data = await serviceFetchExportDatabase(model, type);

                // Lưu từng collection vào file JSON riêng biệt
                const jsonFilePath = path.join(backupDir, `${collection.toLowerCase()}.json`);
                fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
            } else {
                return `Truy vấn dữ liệu ${collection} không hợp lệ`;
            }
        }

        // Nén folder backup thành file .zip
        const zipFilePath = path.resolve(`./src/files/backup/netcode_${timestamp}.zip`);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);
        archive.directory(backupDir, false);
        await archive.finalize();

        // Gửi email kèm file backup .zip
        const auth = await User.findOne({ email: 'support@netcode.vn' }).select('id email full_name');
        if (!auth) {
            return;
        }

        const { sendmail_config, favicon_url } = await App.findOne({}).select('sendmail_config favicon_url');
        if (!sendmail_config) {
            return;
        }

        const transporter = nodemailer.createTransport({
            host: sendmail_config.host,
            port: sendmail_config.port,
            secure: sendmail_config.secure,
            auth: {
                user: sendmail_config.email,
                pass: sendmail_config.password,
            },
        });

        const contentMail = contentSendEmail(
            auth.email,
            `Đây là dữ liệu được backup database Netcode ngày ${moment(new Date()).format('YYYY-MM-DD HH:mm')}`,
            moment(new Date()).format('YYYY-MM-DD HH:mm'),
            favicon_url,
        );

        await transporter.sendMail({
            from: `"Netcode" <${sendmail_config.email}>`,
            to: auth.email,
            subject: `Backup database Netcode ${moment(new Date()).format('YYYY-MM-DD HH:mm')}`,
            html: contentMail,
            attachments: [
                {
                    filename: `netcode_${timestamp}.zip`,
                    path: zipFilePath,
                },
            ],
        });

        // Xóa folder và file backup tạm sau khi gửi email
        fs.rmSync(backupDir, { recursive: true, force: true });
        fs.unlinkSync(zipFilePath);
    } catch (error) {
        configCreateLog('services/cron/database.log', 'serviceCronBackupDatabase', error.message);
    }
};

export { serviceCronBackupDatabase };
