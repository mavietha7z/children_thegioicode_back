import { Paygate } from '~/models/paygate';

const validatorAuthCreatePaygate = async (req, res, next) => {
    const { name, service, vat_tax, logo_url, promotion, discount, bonus_point, callback_code, minimum_payment, maximum_payment } =
        req.body;

    if (!name) {
        return res.status(400).json({ error: 'Tên cổng là trường bắt buộc' });
    }
    if (!['recharge', 'withdrawal'].includes(service)) {
        return res.status(400).json({ error: 'Dịch vụ cổng là trường bắt buộc' });
    }
    if (typeof vat_tax !== 'number' || vat_tax < 0) {
        return res.status(400).json({ error: 'Thuế VAT phải là số và lớn hơn 0' });
    }
    if (!callback_code) {
        return res.status(400).json({ error: 'Callback code là trường bắt buộc' });
    }
    if (typeof minimum_payment !== 'number' || minimum_payment <= 0) {
        return res.status(400).json({ error: 'Tối thiểu thanh toán phải là số và lớn hơn 0' });
    }
    if (typeof maximum_payment !== 'number' || maximum_payment <= 0) {
        return res.status(400).json({ error: 'Tối đa thanh toán phải là số và lớn hơn 0' });
    }
    if (!logo_url) {
        return res.status(400).json({ error: 'Logo cổng là trường bắt buộc' });
    }
    if (promotion && (typeof promotion !== 'number' || promotion < 0 || promotion > 100)) {
        return res.status(400).json({ error: 'Khuyến mãi phải là số và từ 0 đến 100' });
    }
    if (discount && (typeof discount !== 'number' || discount <= 0)) {
        return res.status(400).json({ error: 'Chiết khấu phải là số và lớn hơn 0' });
    }
    if (bonus_point && (typeof bonus_point !== 'number' || bonus_point <= 0)) {
        return res.status(400).json({ error: 'Điểm thưởng phải là số và lớn hơn 0' });
    }

    const isPaygate = await Paygate.findOne({ callback_code });
    if (isPaygate) {
        return res.status(400).json({ error: 'Callback code cổng thanh toán đã tồn tại' });
    }

    next();
};

export { validatorAuthCreatePaygate };
