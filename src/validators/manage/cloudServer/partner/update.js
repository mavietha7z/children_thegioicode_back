import { validatorAuthCreateCloudServerPartner } from './create';

const validatorAuthUpdateCloudServerPartner = async (req, res, next) => {
    const { type } = req.query;

    if (!['status', 'info'].includes(type)) {
        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    }

    if (type === 'info') {
        return validatorAuthCreateCloudServerPartner(req, res, next);
    }

    next();
};

export { validatorAuthUpdateCloudServerPartner };
