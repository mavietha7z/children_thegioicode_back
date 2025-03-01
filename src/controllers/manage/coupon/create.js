import { Coupon } from '~/models/coupon';
import { Cycles } from '~/models/cycles';
import { configCreateLog } from '~/configs';

const controlAuthCreateCoupon = async (req, res) => {
    try {
        const {
            code,
            cycles_id,
            expired_at,
            user_limit,
            pay_method,
            usage_limit,
            apply_users,
            description,
            first_order,
            min_discount,
            service_type,
            max_discount,
            discount_type,
            discount_value,
            recurring_type,
            apply_services,
            apply_all_users,
        } = req.body;

        const cycles = await Cycles.findById(cycles_id).select('display_name');

        const newCoupon = await new Coupon({
            code,
            cycles_id,
            expired_at,
            user_limit,
            pay_method,
            usage_limit,
            apply_users,
            description,
            first_order,
            min_discount,
            service_type,
            max_discount,
            discount_type,
            discount_value,
            recurring_type,
            apply_services,
            apply_all_users,
        }).save();

        const data = {
            code,
            cycles,
            user_limit,
            pay_method,
            expired_at,
            usage_limit,
            apply_users,
            first_order,
            description,
            service_type,
            min_discount,
            max_discount,
            discount_type,
            used_count: 0,
            discount_value,
            recurring_type,
            apply_services,
            apply_all_users,
            id: newCoupon.id,
            key: newCoupon._id,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: newCoupon.status,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới mã giảm giá #${newCoupon.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/coupon/create.log', 'controlAuthCreateCoupon', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateCoupon };
