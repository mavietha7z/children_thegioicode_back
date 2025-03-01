import { Paygate } from '~/models/paygate';
import { configCreateLog } from '~/configs';
import { Userbank } from '~/models/userbank';

const controlAuthDestroyUserbank = async (req, res) => {
    try {
        const { id } = req.query;

        const userbank = await Userbank.findByIdAndDelete(id);
        if (!userbank) {
            return res.status(404).json({ error: 'Ngân hàng của khách hàng cần xoá không tồn tại' });
        }

        const paygates = await Paygate.find({});
        let isPaygate = null;
        for (const paygate of paygates) {
            if (paygate.options.filter((option) => option.userbank_id.toString() === userbank._id.toString())) {
                isPaygate = paygate;
                break;
            }
        }
        if (isPaygate) {
            const options = isPaygate.options.filter((option) => option.userbank_id.toString() !== userbank._id.toString());

            await Paygate.findByIdAndUpdate(isPaygate._id, { options });
        }

        res.status(200).json({
            status: 200,
            message: `Xóa ngân hàng #${userbank.id} của khách hàng thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/userbank/destroy.log', 'controlAuthDestroyUserbank', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyUserbank };
