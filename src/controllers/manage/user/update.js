import bcrypt from 'bcrypt';
import { User } from '~/models/user';
import { configCreateLog } from '~/configs';

const controlAuthUpdateUser = async (req, res) => {
    try {
        const { id } = req.query;
        const {
            role,
            email,
            status,
            username,
            last_name,
            first_name,
            phone_number,
            email_verified,
            phone_verified,
            password: newPassword,
        } = req.body;

        const user = await User.findById(id)
            .populate({ path: 'membership.current', select: 'name' })
            .populate({ path: 'membership.next_membership', select: 'name' });
        if (!user) {
            return res.status(404).json({
                error: 'Người dùng cập nhật không tồn tại',
            });
        }

        const full_name = first_name + ' ' + last_name;

        user.role = role;
        user.email = email;
        user.status = status;
        user.username = username;
        user.full_name = full_name;
        user.last_name = last_name;
        user.first_name = first_name;
        user.phone_number = phone_number;
        user.email_verified = email_verified;
        user.phone_verified = phone_verified;

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(newPassword, salt);

            user.password = password;
        }

        user.updated_at = Date.now();
        await user.save();

        const data = {
            key: id,
            full_name,
            info: {
                email,
                username,
                phone_number,
            },
            role,
            status,
            id: user.id,
            wallet: user.wallet,
            membership: user.membership,
            created_at: user.created_at,
            register_type: user.register_type,
        };

        res.status(200).json({
            status: 200,
            message: 'Cập nhật người dùng thành công',
            data,
        });
    } catch (error) {
        configCreateLog('controllers/manage/user/update.log', 'controlAuthUpdateUser', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateUser };
