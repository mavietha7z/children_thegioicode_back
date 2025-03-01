const validatorAuthCreateCloudServerPartner = async (req, res, next) => {
    const { name, url, key, password, node_select } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Tên đối tác là trường bắt buộc' });
    }
    if (!url) {
        return res.status(400).json({ error: 'Website đối tác là trường bắt buộc' });
    }
    if (!key) {
        return res.status(400).json({ error: 'API key đối tác là trường bắt buộc' });
    }
    if (!password) {
        return res.status(400).json({ error: 'API password đối tác là trường bắt buộc' });
    }
    if (!node_select) {
        return res.status(400).json({ error: 'Node Select Server là trường bắt buộc' });
    }

    next();
};

export { validatorAuthCreateCloudServerPartner };
