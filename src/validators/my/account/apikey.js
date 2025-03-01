const validatorUserUpdateApikey = async (req, res, next) => {
    const { action } = req.query;
    const { api_key } = req.body;

    if (!action || !['config', 'destroy'].includes(action)) {
        return res.status(400).json({
            error: 'Tham số truy vẫn không hợp lệ',
        });
    }
    if (!api_key) {
        return res.status(400).json({
            error: 'Apikey dịch vụ là trường bắt buộc',
        });
    }

    next();
};

export { validatorUserUpdateApikey };
