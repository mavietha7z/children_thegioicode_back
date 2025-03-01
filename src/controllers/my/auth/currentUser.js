import jwt from 'jsonwebtoken';

import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceUserVerifyToken } from '~/services/user/token';
import { serviceGetCurrentUser } from '~/services/user/currentUser';

const controlUserGetCurrent = async (req, res) => {
    try {
        const { session_key } = req.cookies;

        jwt.verify(session_key, 'jwt-session_key-user', async (error, user) => {
            if (error) {
                return res.status(200).clearCookie('session_key').json({
                    data: null,
                    status: 200,
                });
            }

            const isToken = await serviceUserVerifyToken(session_key, 'login', false);
            if (!isToken) {
                return res.status(200).clearCookie('session_key').json({
                    data: null,
                    status: 200,
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

            const currentUser = await User.findById(user.id)
                .populate({
                    path: 'membership.current',
                    select: 'name description',
                })
                .populate({
                    path: 'membership.next_membership',
                    select: 'name achieve_point description',
                });

            const data = await serviceGetCurrentUser(currentUser);

            res.status(200).json({
                data,
                status: 200,
            });
        });
    } catch (error) {
        configCreateLog('controllers/my/auth/currentUser.log', 'controlUserGetCurrent', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetCurrent };
