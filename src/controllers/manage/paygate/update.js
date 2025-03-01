import { Paygate } from '~/models/paygate';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';

const controlAuthUpdatePayGate = async (req, res) => {
    try {
        const { id, type } = req.query;

        const paygate = await Paygate.findById(id);
        if (!paygate) {
            return res.status(404).json({ error: 'Cổng thanh toán cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            paygate.updated_at = Date.now();
            paygate.status = !paygate.status;

            data = true;
            message = 'Bật/Tắt trạng thái cổng thanh toán thành công';
        }

        if (type === 'info') {
            const {
                name,
                service,
                vat_tax,
                logo_url,
                question,
                promotion,
                description,
                bonus_point,
                callback_code,
                minimum_payment,
                maximum_payment,
            } = req.body;

            paygate.name = name;
            paygate.service = service;
            paygate.vat_tax = vat_tax;
            paygate.logo_url = logo_url;
            paygate.question = question;
            paygate.promotion = promotion;
            paygate.updated_at = Date.now();
            paygate.bonus_point = bonus_point;
            paygate.description = description;
            paygate.callback_code = callback_code;
            paygate.minimum_payment = minimum_payment;
            paygate.maximum_payment = maximum_payment;

            data = {
                name,
                service,
                vat_tax,
                logo_url,
                question,
                promotion,
                description,
                bonus_point,
                id: paygate.id,
                minimum_payment,
                maximum_payment,
                key: paygate._id,
                status: paygate.status,
                created_at: paygate.created_at,
                updated_at: paygate.updated_at,
                callback_code,
                option_count: paygate.options.length,
            };
            message = `Cập nhật cổng thanh toán #${paygate.id} thành công`;
        }

        await paygate.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/update.log', 'controlAuthUpdatePayGate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthUpdateOptionPayGate = async (req, res) => {
    try {
        const { paygate_id, userbank_id } = req.body;

        if (!isValidMongoId(paygate_id) || !isValidMongoId(userbank_id)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const paygate = await Paygate.findOne({ _id: paygate_id, 'options.userbank_id': userbank_id });
        if (!paygate) {
            return res.status(404).json({ error: 'Không tìm thấy tài khoản thanh toán' });
        }

        const optionIndex = paygate.options.findIndex((option) => option.userbank_id.toString() === userbank_id);
        if (optionIndex === -1) {
            return res.status(404).json({ error: 'Không tìm thấy tài khoản thanh toán' });
        }

        paygate.options[optionIndex].status = !paygate.options[optionIndex].status;
        await paygate.save();

        res.status(200).json({
            status: 200,
            message: `Cập nhật tài khoản thanh toán thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/update.log', 'controlAuthUpdateOptionPayGate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdatePayGate, controlAuthUpdateOptionPayGate };
