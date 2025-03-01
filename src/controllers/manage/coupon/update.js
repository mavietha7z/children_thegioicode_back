import { Coupon } from '~/models/coupon';
import { configCreateLog } from '~/configs';

const controlAuthUpdateCoupon = async (req, res) => {
    try {
        const { type, id } = req.query;

        const coupon = await Coupon.findById(id)
            .populate({ path: 'apply_services', select: 'id title' })
            .populate({ path: 'apply_users', select: 'id email full_name' })
            .populate({ path: 'cycles_id', select: 'display_name' });
        if (!coupon) {
            return res.status(404).json({
                error: 'Mã giảm giá cần cập nhật không tồn tại',
            });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            coupon.status = !coupon.status;

            data = true;
            message = 'Bật/Tắt trạng thái mã giảm giá thành công';
        }
        if (type === 'info') {
            const {
                code,
                expired_at,
                user_limit,
                pay_method,
                usage_limit,
                first_order,
                description,
                min_discount,
                max_discount,
                discount_type,
                recurring_type,
                discount_value,
            } = req.body;

            coupon.code = code;
            coupon.expired_at = expired_at;
            coupon.user_limit = user_limit;
            coupon.pay_method = pay_method;
            coupon.usage_limit = usage_limit;
            coupon.first_order = first_order;
            coupon.description = description;
            coupon.min_discount = min_discount;
            coupon.max_discount = max_discount;
            coupon.discount_type = discount_type;
            coupon.recurring_type = recurring_type;
            coupon.discount_value = discount_value;

            data = {
                code,
                key: id,
                user_limit,
                pay_method,
                expired_at,
                usage_limit,
                first_order,
                description,
                min_discount,
                max_discount,
                discount_type,
                id: coupon.id,
                discount_value,
                recurring_type,
                status: coupon.status,
                cycles: coupon.cycles_id,
                used_count: coupon.used_count,
                created_at: coupon.created_at,
                updated_at: coupon.updated_at,
                apply_users: coupon.apply_users,
                service_type: coupon.service_type,
                apply_services: coupon.apply_services,
                apply_all_users: coupon.apply_all_users,
            };
            message = `Cập nhật thông tin mã giảm giá #${coupon.id} thành công`;
        }

        coupon.updated_at = Date.now();
        await coupon.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/coupon/update.log', 'controlAuthUpdateCoupon', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateCoupon };
