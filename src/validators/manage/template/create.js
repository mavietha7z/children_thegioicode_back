const validatorAuthCreateTemplate = (req, res, next) => {
    const { title, priority, image_url, view_count, create_count } = req.body;

    if (!title) {
        return res.status(400).json({
            error: 'Tên mã nguồn là trường bắt buộc',
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
    if (typeof create_count !== 'number' || create_count < 0) {
        return res.status(400).json({
            error: 'Số lượt tạo phải là số và lớn hơn 0',
        });
    }

    next();
};

export { validatorAuthCreateTemplate };
