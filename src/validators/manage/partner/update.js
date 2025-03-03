import { validatorAuthCreatePartner } from './create';

const validatorAuthUpdatePartner = async (req, res, next) => {
    const { type } = req.query;

    if (!['status', 'info'].includes(type)) {
        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    }

    if (type === 'info') {
        return validatorAuthCreatePartner(req, res, next);
    }

    next();
};

export { validatorAuthUpdatePartner };
