import { Coupon } from '~/models/coupon';
import { isValidMongoId } from '~/validators';

const validatorAuthCreateCoupon = async (req, res, next) => {
    const {
        code,
        cycles_id,
        expired_at,
        user_limit,
        pay_method,
        usage_limit,
        apply_users,
        min_discount,
        max_discount,
        service_type,
        discount_type,
        discount_value,
        recurring_type,
        apply_services,
        apply_all_users,
    } = req.body;

    if (!apply_services || typeof apply_services !== 'object') {
        return res.status(400).json({ error: 'Dịch vụ được giảm giá không hợp lệ' });
    }
    if (!['Source', 'CloudServerProduct', 'ResourceProduct', 'Template'].includes(service_type)) {
        return res.status(400).json({ error: 'Loại dịch vụ giảm giá không hợp lệ' });
    }

    if (!apply_services.every((service_id) => isValidMongoId(service_id))) {
        return res.status(400).json({ error: 'ID dịch vụ giảm giá không hợp lệ' });
    }

    if (!code) {
        return res.status(400).json({ error: 'Mã giảm giá là trường bắt buộc' });
    }

    const isCode = await Coupon.findOne({ code });
    if (isCode) {
        return res.status(400).json({ error: `Mã giảm giá ${code} đã tồn tại` });
    }

    if (!['app_wallet'].includes(pay_method)) {
        return res.status(400).json({ error: 'Phương thức thanh toán không hợp lệ' });
    }

    if (!['percentage', 'fixed'].includes(discount_type)) {
        return res.status(400).json({ error: 'Loại giảm giá không hợp lệ' });
    }

    if (typeof discount_value !== 'number') {
        return res.status(400).json({ error: 'Vui lòng nhập giá trị giảm giá' });
    }

    if (discount_type === 'percentage' && (discount_value < 0 || discount_value > 100)) {
        return res.status(400).json({ error: 'Giá trị giảm phần trăm phải từ 0% đến 100%' });
    }

    if (discount_type === 'fixed' && discount_value <= 0) {
        return res.status(400).json({ error: 'Giá trị giảm cố định phải lớn hơn 0' });
    }

    if (typeof min_discount !== 'number' || min_discount < 0) {
        return res.status(400).json({ error: 'Giá trị giảm tối thiểu phải là số và lớn hơn 0' });
    }

    if (typeof max_discount !== 'number' || max_discount < 0) {
        return res.status(400).json({ error: 'Giá trị giảm tối đa phải là số và lớn hơn 0' });
    }

    if (min_discount > max_discount) {
        return res.status(400).json({ error: 'Giảm tối thiểu phải nhỏ hơn hoặc bằng giảm tối đa' });
    }

    if (typeof usage_limit !== 'number' || usage_limit < 1) {
        return res.status(400).json({ error: 'Lượt sử dụng mã giảm giá phải lớn hơn 0' });
    }

    if (typeof user_limit !== 'number' || user_limit < 0) {
        return res.status(400).json({ error: 'Lượt sử dụng cho từng khách hàng phải lớn hơn 0' });
    }

    if (!apply_all_users) {
        if (!apply_users.every((user_id) => isValidMongoId(user_id))) {
            return res.status(400).json({ error: 'ID khách hàng không hợp lệ' });
        }
    }

    if (!isValidMongoId(cycles_id)) {
        return res.status(400).json({ error: 'ID chu kỳ giảm giá không hợp lệ' });
    }

    if (!['buy', 'register', 'renew', 'upgrade'].includes(recurring_type)) {
        return res.status(400).json({ error: 'Loại đơn hàng được áp dụng không hợp lệ' });
    }

    if (!expired_at) {
        return res.status(400).json({ error: 'Thời gian gian hết hạn phải đúng định dạng ngày tháng' });
    }

    next();
};

export { validatorAuthCreateCoupon };
