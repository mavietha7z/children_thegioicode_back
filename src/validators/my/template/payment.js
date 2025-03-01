import { isValidDataId } from '~/validators';

const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const regexDomain = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,6}$/;

const validatorUserPaymentTemplate = async (req, res, next) => {
    const { id, cycles: cycles_id, domain, email_admin, password_admin } = req.body;

    if (!isValidDataId(id) || !isValidDataId(cycles_id)) {
        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    }
    if (!regexDomain.test(domain)) {
        return res.status(400).json({ error: 'Tên miền không hợp lệ' });
    }
    if (!regexEmail.test(email_admin)) {
        return res.status(400).json({ error: 'Email quản trị không hợp lệ' });
    }
    if (!password_admin || password_admin.length < 6 || password_admin.length > 20) {
        return res.status(400).json({ error: 'Mật khẩu quản trị không hợp lệ' });
    }

    next();
};

export { validatorUserPaymentTemplate };
