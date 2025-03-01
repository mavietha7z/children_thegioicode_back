import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';

const controlAuthDestroyPricing = async (req, res) => {
    try {
        const { id } = req.query;

        const pricing = await Pricing.findByIdAndDelete(id);
        if (!pricing) {
            return res.status(404).json({ error: 'Giá cả dịch vụ cần xoá không tồn tại' });
        }

        res.status(200).json({
            status: 200,
            message: `Xóa giá cả #${pricing.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/pricing/destroy.log', 'controlAuthDestroyPricing', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyPricing };
