const validateV2Garena = (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: 'Vui lòng điền đầy đủ thông tin',
        });
    }
    if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
            error: 'Tài khoản không đúng định dạng',
        });
    }
    if (password.length < 6 || password.length > 30) {
        return res.status(400).json({
            error: 'Mật khẩu không đúng định dạng',
        });
    }

    next();
};

export { validateV2Garena };
