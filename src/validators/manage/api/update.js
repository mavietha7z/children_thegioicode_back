const validatorAuthUpdateApi = async (req, res, next) => {
    const { title, price, status, version, slug_url, priority, old_price, free_usage, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Tên là trường bắt buộc' });
    }
    if (!slug_url) {
        return res.status(400).json({ error: 'Url seo là trường bắt buộc' });
    }
    if (typeof price !== 'number' || price < 1) {
        return res.status(400).json({ error: 'Giá bán phải là số và lớn hơn 0' });
    }
    if (typeof old_price !== 'number' || old_price < 1) {
        return res.status(400).json({ error: 'Giá cũ phải là số và lớn hơn 0' });
    }
    if (typeof priority !== 'number' || priority < 1) {
        return res.status(400).json({ error: 'Sắp xếp phải là số và lớn hơn 0' });
    }
    if (typeof free_usage !== 'number' || free_usage < 0) {
        return res.status(400).json({ error: 'Lượt dùng thử phải là số và là số dương' });
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
