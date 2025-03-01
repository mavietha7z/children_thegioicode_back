import { Coupon } from '~/models/coupon';
import { configCreateLog } from '~/configs';

const controlAuthDestroyCoupon = async (req, res) => {
    try {
        const { id } = req.query;

        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) {
            return res.status(404).json({ error: 'Mã giảm giá cần xoá không tồn tại' });
        }

        res.status(200).json({
            status: 200,
            message: `Xóa mã giảm giá #${coupon.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/coupon/destroy.log', 'controlAuthDestroyCoupon', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCoupon };
