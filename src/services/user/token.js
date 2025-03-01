import jwt from 'jsonwebtoken';

import { Token } from '~/models/token';
import { generateRandomNumber } from '~/configs';
import { serviceCreateNotificationUser } from './notification';

// Tạo token admin
const generateAccessTokenAuth = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            user_id: user.id,
            admin: user.admin,
            email: user.email,
            status: user.status,
            username: user.username,
            full_name: user.full_name,
            phone_number: user.phone_number,
            register_type: user.register_type,
            phone_verified: user.phone_verified,
            email_verified: user.email_verified,
        },
        'jwt-authen_key-auth',
        {
            expiresIn: '1h',
        },
    );
};

// Tạo token user
const generateAccessTokenUser = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            user_id: user.id,
            email: user.email,
            status: user.status,
            username: user.username,
            full_name: user.full_name,
            phone_number: user.phone_number,
            register_type: user.register_type,
            phone_verified: user.phone_verified,
            email_verified: user.email_verified,
        },
        'jwt-session_key-user',
        {
            expiresIn: '2h',
        },
    );
};

// Tạo token database
const serviceUserCreateToken = async (user_id, modun, service = null, encrypt, token, created_at = Date.now(), expired_at) => {
    try {
        await new Token({
            token,
            modun,
            encrypt,
            user_id,
            service,
            created_at,
            expired_at,
        }).save();

        return true;
    } catch (error) {
        return false;
    }
};

// Xác minh token
const serviceUserVerifyToken = async (token, modun, isDelete = false) => {
    try {
        const currentToken = await Token.findOne({
            token,
            modun,
        }).populate({ path: 'user_id', select: 'id email full_name' });

        if (!currentToken) {
            return null;
        }

        if (isDelete) {
            await currentToken.deleteOne();
        }

        return currentToken;
    } catch (error) {
        return null;
    }
};

// Gửi otp
const serviceUserSendOtpVerifyEmail = async (user_id, module) => {
    try {
        const now = new Date();
        const created_at = now;
        const expireTime = 5 * 60 * 1000;
        const expired_at = now.getTime() + expireTime;

        const token = generateRandomNumber(6, 6);

        await serviceUserCreateToken(user_id, module, 'email', 'random', token, created_at, expired_at);

        // Thông báo email
        await serviceCreateNotificationUser(
            user_id,
            'Email',
            'Mã xác nhận tài khoản Netcode',
            `Mã xác thực của quý khách là: <b>${token}</b>`,
            'Mã xác thực sẽ có hạn trong 5 phút từ thời điểm quý khách nhận được email này.',
        );

        return true;
    } catch (error) {
        return false;
    }
};

export { generateAccessTokenAuth, generateAccessTokenUser, serviceUserCreateToken, serviceUserVerifyToken, serviceUserSendOtpVerifyEmail };
