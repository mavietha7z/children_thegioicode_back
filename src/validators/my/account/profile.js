import { User } from '~/models/user';

function checkAge(birthdayString) {
    const birthday = new Date(birthdayString);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }

    return age >= 12;
}

const regexPhoneNumber = /^0[0-9]{9}$/;
const regexFullName =
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơưĂĨŨƠưĂỊỸƠỚỐỨỀễếệọẠảấầẩẫậắằẳẵặẹẻẽềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý\s]+$/;

const validatorUserUpdateProfile = async (req, res, next) => {
    const { full_name, phone_number, birthday, country, city, address, gender } = req.body;

    const isOldEnough = checkAge(birthday);

    if (!regexFullName.test(full_name)) {
        return res.status(400).json({
            error: 'Họ tên không hợp lệ',
        });
    }
    if (!regexPhoneNumber.test(phone_number)) {
        return res.status(400).json({
            error: 'Số điện thoại không hợp lệ',
        });
    }
    if (!isOldEnough) {
        return res.status(400).json({
            error: 'Ngày sinh chưa đủ 12 tuổi',
        });
    }
    if (!country || country !== 'VN') {
        return res.status(400).json({
            error: 'Quốc gia phải là Việt Nam',
        });
    }
    if (!city) {
        return res.status(400).json({
            error: 'Thành phố là trường bắt buộc',
        });
    }
    if (!address || address.length < 2) {
        return res.status(400).json({
            error: 'Địa chỉ là trường bắt buộc',
        });
    }
    if (!gender || (gender !== 'male' && gender !== 'female' && gender !== 'other')) {
        return res.status(400).json({
            error: 'Giới tính không hợp lệ',
        });
    }

    const isPhoneNumber = await User.findOne({ phone_number, _id: { $ne: req.user.id } }).select('phone_number');
    if (isPhoneNumber) {
        return res.status(400).json({
            error: 'Số điện thoại đã tồn tại',
        });
    }

    next();
};

export { validatorUserUpdateProfile };
