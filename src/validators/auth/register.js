import { User } from '~/models/user';
import { validatorLogin } from './login';

const regexPhoneNumber = /^0[0-9]{9}$/;

const validatorRegister = (req, res, next) => {
    const { first_name, last_name, email, phone_number } = req.body;

    validatorLogin(req, res, async () => {
        if (first_name.length < 2 || last_name.length < 2) {
            return res.status(400).json({
                error: 'Họ tên người dùng không hợp lệ',
            });
        }
        if (phone_number && !regexPhoneNumber.test(phone_number)) {
            return res.status(400).json({
                error: 'Số điện thoại không hợp lệ',
            });
        }

        if (phone_number) {
            const isPhoneNumber = await User.findOne({ phone_number }).select('phone_number');
            if (isPhoneNumber) {
                return res.status(404).json({
                    error: 'Số điện thoại này đã được sử dụng',
                });
            }
        }

        const user = await User.findOne({ email }).select('email');
        if (user) {
            return res.status(404).json({
                error: 'Email này đã được sử dụng',
            });
        }

        next();
    });
};

export { validatorRegister };
