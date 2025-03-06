import moment from 'moment';

import { Wallet } from '~/models/wallet';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';
import { Notification } from '~/models/notification';

const serviceGetCurrentUser = async (user) => {
    try {
        const {
            id,
            email,
            gender,
            birthday,
            location,
            username,
            full_name,
            cover_url,
            avatar_url,
            membership,
            created_at,
            _id: user_id,
            phone_number,
            register_type,
            last_login_at,
            phone_verified,
            email_verified,
            two_factor_auth,
        } = user;

        const cart_count = await CartProduct.countDocuments({ user_id, status: 'pending' });
        const notificationCount = await Notification.countDocuments({ user_id, service: 'Web', unread: true });
        const wallet = await Wallet.findOne({ user_id }).select(
            '-_id bonus_point currency credit_balance bonus_balance main_balance total_balance total_recharge total_withdrawal total_bonus_point expired_at bonus_point_expiry',
        );

        const data = {
            id,
            email,
            gender,
            wallet,
            username,
            location,
            full_name,
            cover_url,
            membership: {
                current: {
                    name: membership.current.name,
                    description: membership.current.description,
                },
                next_membership: {
                    name: membership.next_membership.name,
                    achieve_point: membership.next_membership.achieve_point,
                    description: membership.next_membership.description,
                },
            },
            avatar_url,
            cart_count,
            phone_number,
            register_type,
            phone_verified,
            email_verified,
            notification_count: notificationCount,
            two_factor_auth: two_factor_auth.is_active,
            date_joined: moment(created_at).format('DD/MM/YYYY HH:mm'),
            birthday: birthday ? moment(birthday).format('DD/MM/YYYY') : '',
            last_login_at: moment(last_login_at).format('DD/MM/YYYY HH:mm'),
            two_factor_auth_type: two_factor_auth.is_active ? two_factor_auth.name : null,
        };

        return data;
    } catch (error) {
        configCreateLog('services/user/currentUser.log', 'serviceGetCurrentUser', error.message);
        return null;
    }
};

export { serviceGetCurrentUser };
