import { Wallet } from '~/models/wallet';
import { configCreateLog } from '~/configs';

const serviceAuthGetUsers = async (users = []) => {
    try {
        const data = await Promise.all(
            users.map(async (user) => {
                const {
                    id,
                    role,
                    email,
                    status,
                    _id: key,
                    username,
                    last_name,
                    full_name,
                    first_name,
                    membership,
                    created_at,
                    phone_number,
                    register_type,
                    last_login_at,
                    phone_verified,
                    email_verified,
                } = user;

                const wallet = await Wallet.findOne({ user_id: key }).select('_id id total_balance');

                return {
                    id,
                    key,
                    role,
                    email,
                    wallet,
                    status,
                    username,
                    last_name,
                    full_name,
                    first_name,
                    created_at,
                    membership,
                    phone_number,
                    register_type,
                    last_login_at,
                    phone_verified,
                    email_verified,
                };
            }),
        );

        return data;
    } catch (error) {
        configCreateLog('services/manage/user/get.log', 'serviceAuthGetUsers', error.message);

        return [];
    }
};

export { serviceAuthGetUsers };
