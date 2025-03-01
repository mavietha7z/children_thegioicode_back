const validatorUserClearCart = async (req, res, next) => {
    const data = req.body;

    if (!Array.isArray(data) || data.length < 1) {
        return res.status(400).json({ error: 'Vui lòng gửi sản phẩm cần xoá khỏi giỏ hàng' });
    }

    const isValid = data.every((id) => {
        const idString = id.toString();
        return /^\d{8}$/.test(idString);
    });

    if (!isValid) {
        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    }

    next();
};

export { validatorUserClearCart };
