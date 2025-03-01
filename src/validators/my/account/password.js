const validatorUserChangePassword = async (req, res, next) => {
    const { current_password, new_password, renew_password } = req.body;

    if (!current_password) {
        return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại' });
    }
    if (!new_password) {
        return res.status(400).json({ error: 'Vui lòng nhập mật khẩu mới' });
    }
    if (!renew_password) {
        return res.status(400).json({ error: 'Vui lòng nhập lại mật khẩu mới' });
    }
    if (new_password !== renew_password) {
        return res.status(400).json({ error: 'Mật khẩu nhập lại không trùng khớp' });
    }
    if (current_password === new_password) {
        return res.status(400).json({ error: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
    }

    next();
};

export { validatorUserChangePassword };
