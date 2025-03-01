const validatorUserEnable2Fa = async (req, res, next) => {
    const { two_factor_auth_type } = req.body;

    if (!['Google', 'Email'].includes(two_factor_auth_type)) {
        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    }

    next();
};

const validatorUserVerify2Fa = async (req, res, next) => {
    const { otp, two_factor_auth_type } = req.body;

    if (!otp || otp.length !== 6) {
        return res.status(400).json({ error: 'Mã xác minh không hợp lệ' });
    }
    if (!['Google', 'Email'].includes(two_factor_auth_type)) {
        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    }

    next();
};

export { validatorUserEnable2Fa, validatorUserVerify2Fa };
