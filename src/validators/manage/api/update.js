const validatorAuthUpdateApi = async (req, res, next) => {
    const { title, slug_url, image_url, price, old_price, priority, status, version, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Tên là trường bắt buộc' });
    }
    if (!slug_url) {
        return res.status(400).json({ error: 'Url seo là trường bắt buộc' });
    }
    if (!image_url) {
        return res.status(400).json({ error: 'Đường dẫn ảnh là trường bắt buộc' });
    }
    if (!price || typeof price !== 'number' || price < 1) {
        return res.status(400).json({ error: 'Giá bán phải là số và lớn hơn 0' });
    }
    if (!old_price || typeof old_price !== 'number' || old_price < 1) {
        return res.status(400).json({ error: 'Giá cũ phải là số và lớn hơn 0' });
    }
    if (!priority || typeof priority !== 'number' || priority < 1) {
        return res.status(400).json({ error: 'Sắp xếp phải là số và lớn hơn 0' });
    }
    if (!status || !['activated', 'maintenance', 'blocked'].includes(status)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    if (!version) {
        return res.status(400).json({ error: 'Phiên bản là trường bắt buộc' });
    }
    if (!description) {
        return res.status(400).json({ error: 'Mô tả là trường bắt buộc' });
    }

    next();
};

export { validatorAuthUpdateApi };
