import { Coupon } from '~/models/coupon';
import { configCreateLog } from '~/configs';

const controlAuthGetCoupons = async (req, res) => {
    try {
        const {} = req.query;

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Coupon.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const results = await Coupon.find({})
            .populate({ path: 'apply_services', select: 'id title' })
            .populate({ path: 'apply_users', select: 'id email full_name' })
            .populate({ path: 'cycles_id', select: 'display_name' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                code,
                status,
                _id: key,
                used_count,
                user_limit,
                pay_method,
                created_at,
                updated_at,
                expired_at,
                usage_limit,
                apply_users,
                first_order,
                description,
                max_discount,
                min_discount,
                service_type,
                discount_type,
                recurring_type,
                discount_value,
                apply_services,
                apply_all_users,
                cycles_id: cycles,
            } = result;

            return {
                id,
                key,
                code,
                cycles,
                status,
                used_count,
                user_limit,
                pay_method,
                created_at,
                updated_at,
                expired_at,
                usage_limit,
                apply_users,
                first_order,
                description,
                min_discount,
                max_discount,
                service_type,
                discount_type,
                discount_value,
                recurring_type,
                apply_services,
                apply_all_users,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/coupon/get.log', 'controlAuthGetCoupons', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCoupons };
