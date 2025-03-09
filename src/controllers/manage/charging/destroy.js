import { configCreateLog } from '~/configs';
import { Charging } from '~/models/charging';

const controlAuthDestroyCharging = async (req, res) => {
    try {
        const { id } = req.query;

        const charging = await Charging.findByIdAndDelete(id);
        if (!charging) {
            return res.status(404).json({
                error: 'Không tìm thấy thẻ cào cần xoá',
            });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá thẻ cào #${charging.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/charging/destroy.log', 'controlAuthDestroyCharging', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCharging };
