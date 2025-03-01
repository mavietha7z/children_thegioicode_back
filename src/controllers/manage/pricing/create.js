import { Cycles } from '~/models/cycles';
import { Source } from '~/models/source';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { Template } from '~/models/template';
import { isValidMongoId } from '~/validators';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlAuthCreatePricing = async (req, res) => {
    try {
        const {
            price,
            discount,
            cycles_id,
            service_id,
            other_fees,
            bonus_point,
            penalty_fee,
            renewal_fee,
            upgrade_fee,
            service_type,
            creation_fee,
            brokerage_fee,
            original_price,
            cancellation_fee,
        } = req.body;

        if (!isValidMongoId(service_id)) {
            return res.status(400).json({ error: 'ID dịch vụ không hợp lệ' });
        }
        if (!isValidMongoId(cycles_id)) {
            return res.status(400).json({ error: 'ID chu kỳ không hợp lệ' });
        }

        let service = null;
        if (service_type === 'Source') {
            service = await Source.findById(service_id).select('id title');
            if (!service) {
                return res.status(404).json({ error: 'Mã nguồn cần thêm giá không tồn tại' });
            }
        }
        if (service_type === 'Template') {
            service = await Template.findById(service_id).select('id title');
            if (!service) {
                return res.status(404).json({ error: 'Mẫu website cần thêm giá không tồn tại' });
            }
        }
        if (service_type === 'CloudServerProduct') {
            service = await CloudServerProduct.findById(service_id).select('id title');
            if (!service) {
                return res.status(404).json({ error: 'Gói cấu hình cần thêm giá không tồn tại' });
            }
        }

        const cycles = await Cycles.findById(cycles_id).select('display_name');
        if (!cycles) {
            return res.status(404).json({ error: 'Chu kỳ không tồn tại' });
        }

        const isPricing = await Pricing.findOne({ service_id, service_type, cycles_id });
        if (isPricing) {
            return res.status(400).json({ error: `Đã tồn tại giá sản phẩm này cho chu kỳ ${cycles.display_name}` });
        }

        const newPricing = await new Pricing({
            price,
            discount,
            cycles_id,
            other_fees,
            service_id,
            bonus_point,
            penalty_fee,
            renewal_fee,
            upgrade_fee,
            service_type,
            creation_fee,
            brokerage_fee,
            original_price,
            cancellation_fee,
        }).save();

        const data = {
            price,
            cycles,
            service,
            discount,
            other_fees,
            bonus_point,
            renewal_fee,
            upgrade_fee,
            penalty_fee,
            creation_fee,
            service_type,
            brokerage_fee,
            original_price,
            cancellation_fee,
            id: newPricing.id,
            key: newPricing._id,
            status: newPricing.status,
            created_at: newPricing.created_at,
            updated_at: newPricing.updated_at,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới giá sản phẩm #${newPricing.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/pricing/create.log', 'controlAuthCreatePricing', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreatePricing };
