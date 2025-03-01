import { configCreateLog } from '~/configs';
import { BonusPoint } from '~/models/bonusPoint';

const controlAuthDestroyBonusPoint = async (req, res) => {
    try {
        const { id } = req.query;

        const bonusPoint = await BonusPoint.findByIdAndDelete(id);
        if (!bonusPoint) {
            return res.status(404).json({ error: 'Lịch sử điểm thưởng cần xoá không tồn tại' });
        }

        res.status(200).json({
            status: 200,
            message: `Xóa lịch sử điểm thưởng #${bonusPoint.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/bonusPoint/destroy.log', 'controlAuthDestroyBonusPoint', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyBonusPoint };
