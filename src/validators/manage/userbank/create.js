import { User } from '~/models/user';
import { Userbank } from '~/models/userbank';
import { isValidMongoId } from '~/validators';
import { Localbank } from '~/models/localbank';

const validatorAuthCreateUserBank = async (req, res, next) => {
    const { user_id, localbank_id, account_number, account_holder, account_password } = req.body;

    if (!isValidMongoId(user_id)) {
        return res.status(400).json({ error: 'ID khách hàng không hợp lệ' });
    }
    if (!isValidMongoId(localbank_id)) {
        return res.status(400).json({ error: 'ID ngân hàng không hợp lệ' });
    }

    const user = await User.findById(user_id).select('id email full_name');
    if (!user) {
        return res.status(404).json({ error: 'Khách hàng không tồn tại' });
    }

    const localbank = await Localbank.findById(localbank_id).select('id full_name sub_name');
    if (!localbank) {
        return res.status(404).json({ error: 'Ngân hàng được chọn không tồn tại' });
    }
    if (!account_number) {
        return res.status(400).json({ error: 'Số tài khoản là trường bắt buộc' });
    }
    if (!account_holder) {
        return res.status(400).json({ error: 'Chủ tài khoản là trường bắt buộc' });
    }
    if (account_password && (account_password.length < 6 || account_password.length > 60)) {
        return res.status(400).json({ error: 'Mật khẩu tài khoản không hợp lệ' });
    }

    const isUserbank = await Userbank.findOne({ localbank_id, account_number });
    if (isUserbank) {
        return res.status(400).json({ error: 'Số tài khoản đã tồn tại ở ngân hàng này' });
    }

    req.userbank = user;
    req.localbank = localbank;

    next();
};

export { validatorAuthCreateUserBank };
