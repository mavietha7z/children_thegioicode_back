const validatorAuthCreatePartner = async (req, res, next) => {
    const { name, url, token } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Tên đối tác là trường bắt buộc' });
    }
    if (!url) {
        return res.status(400).json({ error: 'Url website đối tác là trường bắt buộc' });
    }
    if (!token) {
        return res.status(400).json({ error: 'Token đối tác là trường bắt buộc' });
    }

    next();
};

export { validatorAuthCreatePartner };
