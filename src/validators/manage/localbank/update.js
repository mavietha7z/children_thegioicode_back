import { validatorAuthCreateLocalbank } from './create';

const validatorAuthUpdateLocalbank = async (req, res, next) => {
    const { type } = req.query;

    if (!['status', 'info'].includes(type)) {
        return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
    }

    if (type === 'info') {
        return validatorAuthCreateLocalbank(req, res, next);
    }

    next();
};

export { validatorAuthUpdateLocalbank };
