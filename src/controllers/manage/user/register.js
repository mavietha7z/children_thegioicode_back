import bcrypt from 'bcrypt';
import { Api } from '~/models/api';
import { v4 as uuidv4 } from 'uuid';
import { User } from '~/models/user';
import { Cart } from '~/models/cart';
import { Wallet } from '~/models/wallet';
import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';
import { Membership } from '~/models/membership';
import { serviceCreateUniqueUsernameUser } from '~/services/user/username';

const controlAuthRegisterUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone_number, role } = req.body;

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
            role,
            email,
            username,
            last_name,
            full_name,
            first_name,
            membership,
            phone_number,
            password: hashed,
            status: 'activated',
            email_verified: true,
            notification_configs,
            register_type: 'email',
            phone_verified: phone_number ? true : false,
        }).save();

        await new Cart({ user_id: newUser._id }).save();
        const newWallet = await new Wallet({ user_id: newUser._id }).save();

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

        const data = {
            id: newUser.id,
            key: newUser._id,
            full_name: newUser.full_name,
            info: {
                email: newUser.email,
                username: newUser.username,
                phone_number: newUser.phone_number,
            },
            role: newUser.role,
            wallet: {
                id: newWallet.id,
                total_balance: newWallet.total_balance,
            },
            status: newUser.status,
            created_at: newUser.created_at,
            membership: {
                current: {
                    name: memberships[0].name,
                },
                next_membership: {
                    name: memberships[1].name,
                },
            },
            register_type: newUser.register_type,
        };

        res.status(200).json({
            status: 200,
            message: 'Đăng ký tài khoản thành công',
            data,
        });
    } catch (error) {
        configCreateLog('controllers/manage/user/register.log', 'controlAuthRegisterUser', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthRegisterUser };
