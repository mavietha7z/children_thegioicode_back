import { Localbank } from '~/models/localbank';

const validatorAuthCreateLocalbank = async (req, res, next) => {
    const { id } = req.query;
    const { full_name, sub_name, code, type, interbank_code, logo_url } = req.body;

    if (!full_name) {
        return res.status(400).json({ error: 'Tên đầy đủ là trường bắt buộc' });
    }
    if (!sub_name) {
        return res.status(400).json({ error: 'Tên viết tắt là trường bắt buộc' });
    }
    if (!code) {
        return res.status(400).json({ error: 'Mã ngân hàng là trường bắt buộc' });
    }
    if (!type) {
        return res.status(400).json({ error: 'Loại cổng là trường bắt buộc' });
    }
    if (!interbank_code) {
        return res.status(400).json({ error: 'Mã liên ngân hàng là trường bắt buộc' });
    }
    if (!logo_url) {
        return res.status(400).json({ error: 'Logo của ngân hàng là trường bắt buộc' });
    }

    const existingBank = await Localbank.findOne({ interbank_code, _id: { $ne: id } });
    if (existingBank) {
        return res.status(400).json({ error: 'Mã liên ngân hàng đã tồn tại' });
    }

    next();
};

export { validatorAuthCreateLocalbank };
