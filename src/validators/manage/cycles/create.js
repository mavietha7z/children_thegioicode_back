import { Cycles } from '~/models/cycles';

const validatorAuthCreateCycles = async (req, res, next) => {
    const { value, unit, display_name } = req.body;

    if (!display_name) {
        return res.status(400).json({ error: 'Tên hiển thị là trường bắt buộc' });
    }
    if (!unit) {
        return res.status(400).json({ error: 'Đơn vị là trường bắt buộc' });
    }

    if (unit !== 'forever' && (typeof value !== 'number' || value <= 0)) {
        return res.status(400).json({ error: 'Giá trị phải là số và lớn hơn 0' });
    }

    const isCycles = await Cycles.findOne({ value, unit });
    if (isCycles) {
        return res.status(400).json({ error: `Chu kỳ ${isCycles.display_name} đã tồn tại` });
    }

    next();
};

export { validatorAuthCreateCycles };
