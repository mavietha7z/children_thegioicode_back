import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { Api } from '~/models/api';
import { App } from '~/models/app';
import { User } from '~/models/user';
import { Cart } from '~/models/cart';
import { Wallet } from '~/models/wallet';
import { Apikey } from '~/models/apikey';
import { sendEmailNotification } from '~/email';
import { Membership } from '~/models/membership';
import { configCreateLog, generateRandomNumber } from '~/configs';
import { serviceCreateUniqueUsernameUser } from '~/services/user/username';
import { serviceCreateNotificationUser } from '~/services/user/notification';
import { serviceUserCreateToken, serviceUserVerifyToken } from '~/services/user/token';

const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const controlUserSendEmailVerifyRegister = async (req, res) => {
    try {
        const { email } = req.body;

        if (!regexEmail.test(email)) {
            return res.status(400).json({
                error: 'Email không đúng định dạng',
            });
        }

        const isUser = await User.findOne({ email }).select('id email full_name');
        if (isUser) {
            return res.status(400).json({
                error: 'Email này đã được đăng ký',
            });
        }

        const { sendmail_config } = await App.findOne({}).select('sendmail_config');
        if (!sendmail_config) {
            return;
        }

        const now = new Date();
        const created_at = now;
        const expireTime = 5 * 60 * 1000;
        const expired_at = now.getTime() + expireTime;

        const token = generateRandomNumber(6, 6);

        await serviceUserCreateToken(null, 'register', 'email', 'random', token, created_at, expired_at);

        await sendEmailNotification(
            sendmail_config.host,
            sendmail_config.port,
            sendmail_config.secure,
            sendmail_config.email,
            sendmail_config.password,
            email,
            'Mã xác nhận tài khoản Netcode',
            `Mã xác thực của quý khách là: <b>${token}</b>`,
            'Mã xác thực sẽ có hạn trong 5 phút từ thời điểm quý khách nhận được email này.',
        );

        res.status(200).json({
            status: 200,
            message: 'Gửi mã xác minh email thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/auth/register.log', 'controlUserSendEmailVerifyRegister', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserRegisterAccount = async (req, res) => {
    try {
        const { first_name, last_name, email, password, otp } = req.body;

        const currentToken = await serviceUserVerifyToken(otp, 'register', true);
        if (!currentToken) {
            return res.status(400).json({ error: 'Mã xác minh không hợp lệ hoặc đã hết hạn' });
        }

        const full_name = first_name + ' ' + last_name;
        const username = await serviceCreateUniqueUsernameUser(full_name);

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const notification_configs = [
            {
                name: 'Email',
                is_active: false,
                secret_code: null,
            },
            {
                name: 'Telegram',
                is_active: false,
                secret_code: null,
            },
            {
                name: 'Web',
                is_active: true,
                secret_code: null,
            },
        ];

        const memberships = await Membership.find({}).sort({ achieve_point: 1 }).limit(2);
        const membership = {
            current: memberships[0]._id,
            next_membership: memberships[1]._id,
        };

        const newUser = await new User({
            email,
            username,
            last_name,
            full_name,
            first_name,
            membership,
            role: ['user'],
            password: hashed,
            status: 'activated',
            notification_configs,
            email_verified: true,
        }).save();

        await new Cart({ user_id: newUser._id }).save();
        await new Wallet({ user_id: newUser._id }).save();

        const apis = await Api.find({});
        for (let i = 0; i < apis.length; i++) {
            const api = apis[i];

            await new Apikey({
                user_id: newUser._id,
                service_id: api._id,
                service_type: 'Api',
                free_usage: api.free_usage,
                webhooks: {
                    url: [],
                    security_key: '',
                },
                key: `SV-${uuidv4()}`,
                category: api.category,
            }).save();
        }

        // Thông báo web
        await serviceCreateNotificationUser(
            newUser._id,
            'Web',
            'Chúc mừng quý khách đăng ký tài khoản thành công!',
            `Kính chào quý khách ${newUser.full_name}. Cảm ơn quý khách đã đăng ký tài khoản tại Netcode xin mời quý khách sử dụng dịch vụ của Netcode. Trân trọng!`,
        );

        res.status(200).json({
            status: 200,
            message: 'Đăng ký tài khoản thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/auth/register.log', 'controlUserRegisterAccount', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserSendEmailVerifyRegister, controlUserRegisterAccount };
