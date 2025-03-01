import path from 'path';
import moment from 'moment';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import firebaseAdmin from 'firebase-admin';

import { Api } from '~/models/api';
import { User } from '~/models/user';
import { Cart } from '~/models/cart';
import { Wallet } from '~/models/wallet';
import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';
import { Membership } from '~/models/membership';
import { sendMessageBotTelegramApp } from '~/bot';
import { serviceGetCurrentUser } from '~/services/user/currentUser';
import { serviceUserGetIPAddress } from '~/services/user/address';
import { serviceCreateUniqueUsernameUser } from '~/services/user/username';
import { serviceCreateNotificationUser } from '~/services/user/notification';
import { serviceCreateLoginHistoryUser } from '~/services/user/loginHistory';
import { generateAccessTokenUser, serviceUserCreateToken } from '~/services/user/token';

const serviceAccount = require(path.resolve(__dirname, '../../../firebase/key.json'));

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

const controlUserLoginGoogle = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        let user = null;
        let result = null;
        try {
            result = await firebaseAdmin.auth().verifyIdToken(token);
        } catch (error) {
            return res.status(400).json({
                error: 'Đăng nhập thất bại thử lại sau',
            });
        }

        const { name, picture, email, email_verified, uid } = result;

        const isUser = await User.findOne({ email })
            .populate({
                path: 'membership.current',
                select: 'name description',
            })
            .populate({
                path: 'membership.next_membership',
                select: 'name achieve_point description',
            });
        if (isUser) {
            await isUser.updateOne({ avatar_url: picture });

            user = isUser;
        } else {
            const nameParts = name.split(/\s+/);
            const first_name = nameParts[0];
            const last_name = nameParts.slice(1).join(' ') || 'Null';

            const username = await serviceCreateUniqueUsernameUser(name);

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(`${uid}_${Date.now().toString()}`, salt);

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
                first_name,
                membership,
                email_verified,
                role: ['user'],
                full_name: name,
                password: hashed,
                status: 'activated',
                avatar_url: picture,
                notification_configs,
                register_type: 'google',
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

            // Tạo thông báo đăng ký thành công
            await serviceCreateNotificationUser(
                newUser._id,
                'Web',
                'Chúc mừng quý khách đăng ký tài khoản thành công!',
                `Kính chào quý khách ${newUser.full_name}. Cảm ơn quý khách đã đăng ký tài khoản tại Thegioicode xin mời quý khách sử dụng dịch vụ của Thegioicode. Trân trọng!`,
            );

            // Bot telegram
            sendMessageBotTelegramApp(
                `Tài khoản mới: \n ${newUser.email} \n ${newUser.full_name} \n ${newUser.register_type} \n ${newUser.phone_number}`,
            );

            user = newUser;
        }

        if (user.role.length === 1 && user.role.includes('user')) {
            // Tạo lịch sử đăng nhập
            const ip = serviceUserGetIPAddress(req);
            await serviceCreateLoginHistoryUser(user._id, ip, req);

            // Tạo thông báo đăng nhập mới
            await serviceCreateNotificationUser(
                user._id,
                'Web',
                'Quý khách đăng nhập từ thiết bị mới?',
                `Kính chào quý khách ${
                    user.full_name
                }. Tài khoản của quý khách vừa được truy cập từ thiết bị mới, chi tiết như sau: Địa chỉ IPV4/V6: ${ip} Thiết bị: ${
                    req.device.os.name
                } ${req.device.os.version} Tên thiết bị trình duyệt: ${req.device.client.name} ${
                    req.device.client.version
                } Thời gian: ${moment(new Date()).format(
                    'DD/MM/YYYY HH:mm:ss',
                )}. Nếu truy cập trên đúng là từ quý khách, vui lòng bỏ qua thông báo này. Ngược lại, Thegioicode đề nghị quý khách đăng nhập lại và thực hiện đổi mật khẩu. Trân trọng!`,
            );
        }

        user.last_login_at = Date.now();
        await user.save();

        const data = await serviceGetCurrentUser(user);

        // Lấy token để trả về
        const accessToken = generateAccessTokenUser(user);
        const created_at = new Date();
        const expired_at = new Date(created_at.getTime() + 2 * 60 * 60 * 1000);
        await serviceUserCreateToken(user._id, 'login', null, 'jsonwebtoken', accessToken, created_at, expired_at);

        res.status(200)
            .cookie('session_key', accessToken, {
                httpOnly: true,
                secure: true,
                path: '/',
                sameSite: 'strict',
                domain: req.hostUrl,
            })
            .json({
                data,
                status: 200,
                message: 'Đăng nhập tài khoản thành công',
            });
    } catch (error) {
        configCreateLog('controllers/my/auth/loginGoogle.log', 'controlUserLoginGoogle', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserLoginGoogle };
