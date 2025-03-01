import { User } from '~/models/user';
import { Token } from '~/models/token';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { serviceAuthGetUsers } from '~/services/manage/user/get';
import { generateAccessTokenUser, serviceUserCreateToken } from '~/services/user/token';

const controlAuthGetUsers = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await User.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const users = await User.find(objectQuery)
            .populate({ path: 'membership.current', select: 'name' })
            .populate({ path: 'membership.next_membership', select: 'name' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = await serviceAuthGetUsers(users);

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/user/get.log', 'controlAuthGetUsers', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthLogoutAllUsers = async (req, res) => {
    try {
        await Token.deleteMany({ user_id: { $ne: req.user.id }, modun: 'login', encrypt: 'jsonwebtoken' });

        res.status(200).json({
            status: 200,
            message: 'Đăng xuất tất cả khách hàng thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/user/get.log', 'controlAuthLogoutAllUsers', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthLoginUser = async (req, res) => {
    try {
        const { id } = req.query;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Tài khoản cần đăng nhập không tồn tại' });
        }
        if (user.status === 'inactivated') {
            return res.status(400).json({
                error: 'Tài khoản cần đăng nhập không hoạt động',
            });
        }
        if (user.status === 'blocked') {
            return res.status(400).json({
                error: 'Tài khoản cần đăng nhập đã bị khóa',
            });
        }

        const accessToken = generateAccessTokenUser(user);
        const created_at = new Date();
        const expired_at = new Date(created_at.getTime() + 2 * 60 * 60 * 1000);
        await serviceUserCreateToken(user._id, 'login', null, 'jsonwebtoken', accessToken, created_at, expired_at);

        res.cookie('session_key', accessToken, {
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'strict',
            domain: req.hostUrl,
        }).redirect(req.domainDefault);
    } catch (error) {
        configCreateLog('controllers/manage/user/get.log', 'controlAuthLoginUser', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetUsers, controlAuthLogoutAllUsers, controlAuthLoginUser };
