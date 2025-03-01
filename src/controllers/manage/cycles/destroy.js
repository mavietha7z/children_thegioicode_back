import { Cycles } from '~/models/cycles';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';

const controlAuthDestroyCycles = async (req, res) => {
    try {
        const { id } = req.query;

        const cycles = await Cycles.findByIdAndDelete(id);
        if (!cycles) {
            return res.status(404).json({ error: 'Chu kỳ dịch vụ cần xoá không tồn tại' });
        }

        await Pricing.deleteMany({ cycles_id: cycles._id });

        res.status(200).json({
            status: 200,
            message: `Xóa chu kỳ #${cycles.id} và giá cả chu kỳ thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cycles/destroy.log', 'controlAuthDestroyCycles', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCycles };
