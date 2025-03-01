import unidecode from 'unidecode';

import { User } from '~/models/user';

// Hàm tạo username từ full name
const generateUsernameUser = (fullName) => {
    const fullNameWithoutAccent = unidecode(fullName);

    let truncatedFullName = fullNameWithoutAccent;
    if (fullNameWithoutAccent.length > 16) {
        truncatedFullName = fullNameWithoutAccent.substring(0, 16);
    }

    const username = truncatedFullName.toLowerCase().replace(/\s+/g, '');

    return username;
};

// Hàm kiểm tra xem username đã tồn tại trong cơ sở dữ liệu chưa
const isUsernameExists = async (username) => {
    const isUsername = await User.findOne({ username });

    if (isUsername) {
        return true;
    }

    return false;
};

// Hàm tạo username duy nhất từ full name
const serviceCreateUniqueUsernameUser = async (fullName) => {
    let username = generateUsernameUser(fullName);
    let isExists = await isUsernameExists(username);

    if (isExists) {
        let randomDigits = Math.floor(100 + Math.random() * 900);
        username += randomDigits;
    }

    return username;
};

export { serviceCreateUniqueUsernameUser };
