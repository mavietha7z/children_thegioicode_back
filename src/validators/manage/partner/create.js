const validatorAuthCreatePartner = async (req, res, next) => {
    const { name, url, token, difference_public_api, difference_cloud_server } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Tên đối tác là trường bắt buộc' });
    }
    if (!url) {
        return res.status(400).json({ error: 'Url website đối tác là trường bắt buộc' });
    }
    if (!token) {
        return res.status(400).json({ error: 'Token đối tác là trường bắt buộc' });
    }
    if (typeof difference_public_api !== 'number') {
        return res.status(400).json({ error: 'Giá chênh lệch dịch vụ API là trường bắt buộc' });
    }
    if (typeof difference_cloud_server !== 'number') {
        return res.status(400).json({ error: 'Giá chênh lệch dịch vụ máy chủ là trường bắt buộc' });
    }

    next();
};

export { validatorAuthCreatePartner };
