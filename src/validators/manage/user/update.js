import bcrypt from 'bcrypt';
import { User } from '~/models/user';

const phoneRegex = /^0[0-9]{9}$/;
const passwordRegex = /^\S{6,30}$/;
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const validatorAuthUpdateUser = async (req, res, next) => {
    const { id } = req.query;
    const { role: roleUser } = req.user;
    const { first_name, last_name, username, password, email, phone_number, phone_verified, status, role } = req.body;

    let isRoleUser = false;
    for (let i = 0; i < roleUser.length; i++) {
        if (roleUser[i] === 'admin') {
            isRoleUser = true;
        }
    }

    if (first_name.length < 2 || last_name.length < 2) {
        return res.status(400).json({
            error: 'Tên người dùng không hợp lệ',
        });
    }

    const isUsername = await User.findOne({ username, _id: { $ne: id } });
    if (isUsername) {
        return res.status(400).json({
            error: 'Username này đã được sử dụng',
        });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Địa chỉ email không hợp lệ',
        });
    }
    const isEmail = await User.findOne({ email, _id: { $ne: id } });
    if (isEmail) {
        return res.status(400).json({
            error: 'Địa chỉ email đã được sử dụng',
        });
    }

    if (phone_number && !phoneRegex.test(phone_number)) {
        return res.status(400).json({
            error: 'Số điện thoại không hợp lệ',
        });
    }
    if (!phone_number && phone_verified) {
        return res.status(400).json({
            error: 'SĐT không tồn tại không thể xác minh',
        });
    }
    if (phone_number) {
        const isPhoneNumber = await User.findOne({ phone_number, _id: { $ne: id } });
        if (isPhoneNumber) {
            return res.status(400).json({
                error: 'SĐT này đã được sử dụng',
            });
        }
    }

    if (role) {
        for (let i = 0; i < role.length; i++) {
            if (role[i] === 'admin' && !isRoleUser) {
                return res.status(400).json({
                    error: 'Bạn không thể phân quyền admin',
                });
            }
        }
    }

    if (password && !passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'Mật khẩu người dùng không hợp lệ',
        });
    }
    if (password) {
        const user = await User.findById(id).select('password');
        const isPassword = await bcrypt.compare(password, user.password);

        if (isPassword) {
            return res.status(400).json({
                error: 'Mật khẩu mới không được trùng mật cũ',
            });
        }
    }

    if (!['activated', 'inactivated', 'blocked'].includes(status)) {
        return res.status(400).json({
            error: 'Trạng thái tài khoản không hợp lệ',
        });
    }

    next();
};

export { validatorAuthUpdateUser };
