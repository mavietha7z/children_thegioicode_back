import { Api } from '~/models/api';

const validatorAuthCreateApi = async (req, res, next) => {
    const { title, category, price, old_price, priority, version, status, image_url, free_usage, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Tên là trường bắt buộc' });
    }
    if (!category) {
        return res.status(400).json({ error: 'Category là trường bắt buộc' });
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
    if (!version) {
        return res.status(400).json({ error: 'Phiên bản là trường bắt buộc' });
    }
    if (!status || !['activated', 'maintenance', 'blocked'].includes(status)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    if (!image_url) {
        return res.status(400).json({ error: 'Đường dẫn ảnh là trường bắt buộc' });
    }
    if (typeof free_usage !== 'number' || free_usage < 0) {
        return res.status(400).json({ error: 'Lượt dùng miễn phí phải là số và lớn hơn 0' });
    }
    if (!description) {
        return res.status(400).json({ error: 'Mô tả là trường bắt buộc' });
    }

    const isApi = await Api.findOne({ category });
    if (isApi) {
        return res.status(400).json({ error: `API có category ${category} đã tồn tại` });
    }

    next();
};

export { validatorAuthCreateApi };
