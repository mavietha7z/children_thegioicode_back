import { User } from '~/models/user';
import { configCreateLog } from '~/configs';

const controlUserUpdateProfile = async (req, res) => {
    try {
        const { avatar_url, full_name, phone_number, birthday, country, city, address, gender } = req.body;

        const fullName = full_name.trim();
        const nameParts = fullName.split(/\s+/);
        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(' ');

        await User.findByIdAndUpdate(req.user.id, {
            first_name,
            last_name,
            full_name,
            avatar_url,
            phone_number,
            birthday,
            location: {
                country,
                city,
                address,
            },
            gender,
        });

        res.status(200).json({
            status: 200,
            message: 'Cập nhật thông tin cá nhân thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/account/profile.log', 'controlUserUpdateProfile', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserUpdateProfile };
