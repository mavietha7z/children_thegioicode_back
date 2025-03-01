import { Coupon } from '~/models/coupon';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';
import { OrderTemplate } from '~/models/orderTemplate';
import { OrderCloudServer } from '~/models/orderCloudServer';

const controlUserApplyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const coupon = await Coupon.findOne({ code, status: true });
        if (!coupon) {
            return res.status(404).json({ error: 'Không thể áp dụng chương trình này' });
        }

        if (coupon.expired_at < new Date()) {
            return res.status(400).json({ error: 'Chương trình áp dụng đã hết hạn' });
        }

        if (coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ error: 'Chương trình áp dụng đã hết lượt sử dụng' });
        }

        if (!coupon.apply_all_users && coupon.apply_users.length > 0) {
            if (!coupon.apply_users.includes(req.user.id)) {
                return res.status(400).json({ error: 'Chương trình không áp dụng cho tài khoản này' });
            }
        }

        if (coupon.first_order) {
            let isOrder = null;
            if (coupon.service_type === 'CloudServerProduct') {
                isOrder = await OrderCloudServer.findOne({});
            }
            if (coupon.service_type === 'Template') {
                isOrder = await OrderTemplate.findOne({});
            }
            if (!isOrder) {
                return res.status(400).json({ error: 'Chương trình chỉ áp dụng cho đơn hàng đầu tiên' });
            }
        }

        const cartProducts = await CartProduct.find({ user_id: req.user.id, status: 'pending' })
            .populate({
                path: 'product_id',
            })
            .populate({
                path: 'pricing_id',
                select: 'id service_id price discount bonus_point cycles_id',
                populate: { path: 'cycles_id', select: 'id unit value display_name' },
            })
            .populate({ path: 'partner_service_id' })
            .sort({ created_at: -1 });

        let appliedProducts = [];

        for (const product of cartProducts) {
            const productIdCheck = product.product_id.product_id ? product.product_id.product_id._id : product.product_id._id;
            const productTypeCheck = product.product_type === 'OrderCloudServer' ? 'CloudServerProduct' : product.product_type;

            const applyServiceCheck = coupon.apply_services.includes(productIdCheck);
            const cyclesCheck = product.pricing_id.cycles_id._id.toString() === coupon.cycles_id.toString();

            if (cyclesCheck && productTypeCheck === coupon.service_type && product.module === coupon.recurring_type && applyServiceCheck) {
                appliedProducts.push(product);
                product.coupon_id = coupon._id;
                await product.save();
            }
        }

        if (appliedProducts.length === 0) {
            return res.status(400).json({ error: 'Chương trình áp dụng không phù hợp' });
        }

        res.status(200).json({
            status: 200,
            message: 'Áp dụng mã giảm giá thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/cart/coupon.log', 'controlUserApplyCoupon', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserRemoveCoupon = async (req, res) => {
    try {
        const { coupon_id } = req.params;

        const coupon = await Coupon.findOne({ id: coupon_id });
        if (!coupon) {
            return res.status(404).json({ error: 'Không tìm thấy mã giảm giá cần xoá' });
        }

        const products = await CartProduct.find({ coupon_id: coupon._id });

        for (const product of products) {
            product.coupon_id = null;
            await product.save();
        }

        res.status(200).json({
            status: 200,
            message: 'Xoá mã giảm giá thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/cart/coupon.log', 'controlUserRemoveCoupon', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserApplyCoupon, controlUserRemoveCoupon };
