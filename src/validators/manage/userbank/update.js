const validatorAuthUpdateUserBank = async (req, res, next) => {
    const { type } = req.query;
    const { account_number, account_holder, account_password } = req.body;

    if (!['status', 'info'].includes(type)) {
        return res.status(400).json({
            error: 'Tham số truy vấn không hợp lệ',
        });
    }

    if (type === 'status') {
        return next();
    }

    if (!account_number) {
        return res.status(400).json({ error: 'Số tài khoản là trường bắt buộc' });
    }
    if (!account_holder) {
        return res.status(400).json({ error: 'Chủ tài khoản là trường bắt buộc' });
    }
    if (account_password && (account_password.length < 6 || account_password.length > 30)) {
        return res.status(400).json({ error: 'Mật khẩu tài khoản không hợp lệ' });
    }

    next();
};

export { validatorAuthUpdateUserBank };
