import { Paygate } from '~/models/paygate';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';

const controlAuthDestroyPaygate = async (req, res) => {
    try {
        const { id } = req.query;

        const paygate = await Paygate.findByIdAndDelete(id);
        if (!paygate) {
            return res.status(404).json({ error: 'Không tìm thấy cổng thanh toán cần xoá' });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá cổng thanh toán #${paygate.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/destroy.log', 'controlAuthDestroyPaygate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthDestroyOptionPaygate = async (req, res) => {
    try {
        const { paygate_id, userbank_id } = req.body;

        if (!isValidMongoId(paygate_id) || !isValidMongoId(userbank_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const paygate = await Paygate.findOne({ _id: paygate_id, 'options.userbank_id': userbank_id });
        if (!paygate) {
            return res.status(404).json({ error: 'Không tìm tài khoản thanh toán' });
        }

        const indexOption = paygate.options.findIndex((option) => option.userbank_id.toString() === userbank_id);
        if (indexOption === -1) {
            return res.status(404).json({ error: 'Không tìm tài khoản thanh toán' });
        }

        paygate.options.splice(indexOption, 1);
        await paygate.save();

        res.status(200).json({
            status: 200,
            message: 'Xoá tài khoản thanh toán thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/destroy.log', 'controlAuthDestroyOptionPaygate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyPaygate, controlAuthDestroyOptionPaygate };
