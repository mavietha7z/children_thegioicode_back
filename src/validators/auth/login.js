const validatorLogin = async (req, res, next) => {
    const { email, password } = req.body;

    const regexPassword = /^\S{6,30}$/;
    const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!regexEmail.test(email)) {
        return res.status(400).json({
            error: 'Email không đúng định dạng',
        });
    }

    if (!regexPassword.test(password)) {
        return res.status(400).json({
            error: 'Mật khẩu không đúng định dạng',
        });
    }

    next();
};

export { validatorLogin };
