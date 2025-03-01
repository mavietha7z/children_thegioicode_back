import { Paygate } from '~/models/paygate';
import { configCreateLog } from '~/configs';
import { Userbank } from '~/models/userbank';
import { Localbank } from '~/models/localbank';

const controlAuthDestroyLocalbank = async (req, res) => {
    try {
        const { id } = req.query;

        const localbank = await Localbank.findByIdAndDelete(id);
        if (!localbank) {
            return res.status(404).json({ error: 'Ngân hàng cần xoá không tồn tại' });
        }

        const userbanks = await Userbank.find({ localbank_id: localbank._id });
        for (const userbank of userbanks) {
            const paygates = await Paygate.find({});

            for (const paygate of paygates) {
                const updatedOptions = paygate.options.filter((option) => option.userbank_id.toString() !== userbank._id.toString());

                if (updatedOptions.length !== paygate.options.length) {
                    paygate.options = updatedOptions;

                    await paygate.save();
                }
            }

            await userbank.deleteOne();
        }

        res.status(200).json({
            status: 200,
            message: `Xóa ngân hàng #${localbank.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/localbank/destroy.log', 'controlAuthDestroyLocalbank', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyLocalbank };
