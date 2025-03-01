const validatorAuthCreateSource = (req, res, next) => {
    const { title, version, priority, image_url, view_count, purchase_count } = req.body;

    if (!title) {
        return res.status(400).json({
            error: 'Tên mã nguồn là trường bắt buộc',
        });
    }
    if (!version) {
        return res.status(400).json({
            error: 'Phiên bản là trường bắt buộc',
        });
    }
    if (typeof priority !== 'number' || priority < 1) {
        return res.status(400).json({
            error: 'Độ ưu tiên phải là số và lớn hơn 0',
        });
    }
    if (!image_url) {
        return res.status(400).json({
            error: 'Ảnh mã nguồn là trường bắt buộc',
        });
    }
    if (typeof view_count !== 'number' || view_count < 0) {
        return res.status(400).json({
            error: 'Số lượt xem phải là số và lớn hơn 0',
        });
    }
    if (typeof purchase_count !== 'number' || purchase_count < 0) {
        return res.status(400).json({
            error: 'Số lượt mua phải là số và lớn hơn 0',
        });
    }

    next();
};

export { validatorAuthCreateSource };
