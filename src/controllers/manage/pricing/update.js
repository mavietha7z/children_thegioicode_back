import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';

const controlAuthUpdatePricing = async (req, res) => {
    try {
        const { type, id } = req.query;

        const pricing = await Pricing.findById(id)
            .populate({ path: 'service_id', select: 'id title' })
            .populate({ path: 'cycles_id', select: 'display_name' });
        if (!pricing) {
            return res.status(404).json({
                error: 'Giá cả cần cập nhật không tồn tại',
            });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            pricing.status = !pricing.status;

            data = true;
            message = 'Bật/Tắt trạng thái giá cả thành công';
        }
        if (type === 'info') {
            const {
                price,
                discount,
                other_fees,
                bonus_point,
                renewal_fee,
                upgrade_fee,
                penalty_fee,
                service_type,
                creation_fee,
                brokerage_fee,
                cancellation_fee,
            } = req.body;

            pricing.price = price;
            pricing.discount = discount;
            pricing.other_fees = other_fees;
            pricing.bonus_point = bonus_point;
            pricing.renewal_fee = renewal_fee;
            pricing.upgrade_fee = upgrade_fee;
            pricing.penalty_fee = penalty_fee;
            pricing.service_type = service_type;
            pricing.creation_fee = creation_fee;
            pricing.brokerage_fee = brokerage_fee;
            pricing.cancellation_fee = cancellation_fee;

            data = {
                price,
                discount,
                other_fees,
                penalty_fee,
                renewal_fee,
                bonus_point,
                creation_fee,
                service_type,
                brokerage_fee,
                id: pricing.id,
                key: pricing.key,
                cancellation_fee,
                updated_at: Date.now(),
                status: pricing.status,
                cycles: pricing.cycles_id,
                service: pricing.service_id,
                created_at: pricing.created_at,
            };
            message = `Cập nhật giá cả dịch vụ #${pricing.service_id.id} thành công`;
        }

        pricing.updated_at = Date.now();
        await pricing.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/pricing/update.log', 'controlAuthUpdatePricing', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdatePricing };
