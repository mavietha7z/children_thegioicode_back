import jwt from 'jsonwebtoken';
import { User } from '~/models/user';
import { serviceUserVerifyToken } from '~/services/user/token';

const middleware = {
    // USER
    verifyUser: (req, res, next) => {
        const { session_key } = req.cookies;

        if (!session_key) {
            return res.status(401).json({
                status: 401,
                error: 'Vui lòng xác minh người dùng',
            });
        }

        jwt.verify(session_key, 'jwt-session_key-user', async (error, user) => {
            if (error) {
                return res.status(403).clearCookie('session_key').json({
                    status: 403,
                    error: 'Mã xác minh của bạn đã hết hạn',
                });
            }

            const isToken = await serviceUserVerifyToken(session_key, 'login', false);
            if (!isToken) {
                return res.status(403).clearCookie('session_key').json({
                    status: 403,
                    error: 'Mã xác minh của bạn đã hết hạn',
                });
            }

            if (user.status === 'inactivated') {
                return res.status(403).clearCookie('session_key').json({
                    status: 403,
                    error: 'Tài khoản bạn đã bị tạm khóa',
                });
            }
            if (user.status === 'blocked') {
                return res.status(403).clearCookie('session_key').json({
                    status: 403,
                    error: 'Tài khoản bạn đã bị khóa',
                });
            }

            const userToken = await User.findById(user.id).select('full_name role status');
            if (!userToken) {
                return res.status(401).clearCookie('session_key').json({
                    status: 401,
                    error: 'Vui lòng xác minh người dùng',
                });
            }

            req.user = user;
            next();
        });
    },

    // ADMIN
    verifyAuth: (req, res, next) => {
        const { authen_key } = req.cookies;

        if (!authen_key) {
            return res.status(401).json({
                status: 401,
                error: 'Vui lòng xác minh người dùng',
            });
        }

        jwt.verify(authen_key, 'jwt-authen_key-auth', async (error, user) => {
            if (error) {
                return res.status(403).clearCookie('authen_key').json({
                    status: 403,
                    error: 'Mã xác minh của bạn đã hết hạn',
                });
            }

            const isToken = await serviceUserVerifyToken(authen_key, 'login', false);
            if (!isToken) {
                return res.status(403).clearCookie('authen_key').json({
                    status: 403,
                    error: 'Mã xác minh của bạn đã hết hạn',
                });
            }

            if (user.status === 'inactivated') {
                return res.status(403).clearCookie('authen_key').json({
                    status: 403,
                    error: 'Tài khoản bạn đã bị tạm khóa',
                });
            }
            if (user.status === 'blocked') {
                return res.status(403).clearCookie('authen_key').json({
                    status: 403,
                    error: 'Tài khoản bạn đã bị khóa',
                });
            }

            let isAdmin = false;
            for (let i = 0; i < user.role.length; i++) {
                if (user.role[i] === 'admin') {
                    isAdmin = true;
                    break;
                }
            }
            if (!user.admin || !isAdmin) {
                return res.status(403).clearCookie('authen_key').json({
                    status: 403,
                    error: 'Bạn không có quyền quản trị',
                });
            }

            const userToken = await User.findById(user.id).select('full_name admin role status');
            if (!userToken) {
                return res.status(401).clearCookie('authen_key').json({
                    status: 401,
                    error: 'Vui lòng xác minh người dùng',
                });
            }

            req.user = user;
            next();
        });
    },

    // USER OR ADMIN
    verifyUserOrAuth: (req, res, next) => {
        let { session_key, authen_key } = req.cookies;

        // Ưu tiên sử dụng authen_key nếu cả hai cùng tồn tại
        if (session_key && authen_key) {
            session_key = null;
        }

        if (!session_key && !authen_key) {
            return res.status(401).json({
                status: 401,
                error: 'Vui lòng xác minh người dùng',
            });
        }

        const token = authen_key || session_key;
        const cookieName = authen_key ? 'authen_key' : 'session_key';
        const secret = authen_key ? 'jwt-authen_key-auth' : 'jwt-session_key-user';

        jwt.verify(token, secret, async (error, user) => {
            if (error) {
                return res.status(403).clearCookie(cookieName).json({
                    status: 403,
                    error: 'Mã xác minh của bạn đã hết hạn',
                });
            }

            const isToken = await serviceUserVerifyToken(token, 'login', false);
            if (!isToken) {
                return res.status(403).clearCookie(cookieName).json({
                    status: 403,
                    error: 'Mã xác minh của bạn đã hết hạn',
                });
            }

            if (user.status === 'inactivated') {
                return res.status(403).clearCookie(cookieName).json({
                    status: 403,
                    error: 'Tài khoản bạn đã bị tạm khóa',
                });
            }
            if (user.status === 'blocked') {
                return res.status(403).clearCookie(cookieName).json({
                    status: 403,
                    error: 'Tài khoản bạn đã bị khóa',
                });
            }

            const userToken = await User.findById(user.id).select('full_name admin role status');
            if (!userToken) {
                return res.status(401).clearCookie(cookieName).json({
                    status: 401,
                    error: 'Vui lòng xác minh người dùng',
                });
            }

            if (user.role.includes('admin') || user.role.includes('user')) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({
                    status: 403,
                    error: 'Bạn không có quyền truy cập',
                });
            }
        });
    },
};

export default middleware;
