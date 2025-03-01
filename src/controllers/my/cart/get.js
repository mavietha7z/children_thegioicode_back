import { Cart } from '~/models/cart';
import { Pricing } from '~/models/pricing';
import { CartProduct } from '~/models/cartProduct';
import { configCreateLog, configGetDiscountRulePartner } from '~/configs';

const controlUserGetCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.user.id, status: true });
        if (!cart) {
            return res.status(404).json({
                error: 'Giỏ hàng của bạn không tồn tại hoặc đã bị khoá',
            });
        }

        const cartProducts = await CartProduct.find({ user_id: req.user.id, status: 'pending' })
            .populate({
                path: 'pricing_id',
                select: 'id service_id price discount bonus_point cycles_id',
                populate: { path: 'cycles_id', select: 'id unit value display_name' },
            })
            .populate({ path: 'partner_service_id', select: 'id discount_rules service_register' })
            .populate({ path: 'coupon_id', select: 'id code discount_type discount_value description' })
            .sort({ created_at: -1 });

        let coupons = [];
        let total_price = 0;
        let bonus_point = 0;
        let total_payment = 0;

        const data = await Promise.all(
            cartProducts.map(async (product) => {
                const resultPricings = await Pricing.find({ service_id: product.pricing_id.service_id, status: true }).populate({
                    path: 'cycles_id',
                    select: 'id value unit display_name',
                });

                const pricings = resultPricings.map((pricing) => {
                    return {
                        id: pricing.id,
                        discount: pricing.discount,
                        cycles: {
                            id: pricing.cycles_id.id,
                            unit: pricing.cycles_id.unit,
                            value: pricing.cycles_id.value,
                            display_name: pricing.cycles_id.display_name,
                        },
                    };
                });

                let origin_price = product.pricing_id.price;
                let product_price = origin_price;
                bonus_point += product.pricing_id.bonus_point;

                // Áp dụng chiết khấu đối tác
                let partner_discount = 0;
                if (product.partner_service_id) {
                    partner_discount = configGetDiscountRulePartner(
                        product.partner_service_id.service_register,
                        product.partner_service_id.discount_rules,
                    );
                    product_price -= (product_price * partner_discount) / 100;
                }

                // Áp dụng mã giảm giá
                if (product.coupon_id) {
                    if (product.coupon_id.discount_type === 'percentage') {
                        product_price -= (product_price * product.coupon_id.discount_value) / 100;
                    } else if (product.coupon_id.discount_type === 'fixed') {
                        product_price -= product.coupon_id.discount_value;
                    }
                } else if (product.pricing_id.discount) {
                    // Áp dụng chiết khấu chu kỳ thanh toán nếu không có mã giảm giá
                    product_price -= (product_price * product.pricing_id.discount) / 100;
                }

                total_price += origin_price;
                total_payment += product_price;

                let data = {
                    pricings,
                    origin_price,
                    id: product.id,
                    title: product.title,
                    price: product_price,
                    quantity: product.quantity,
                    description: product.description,
                    pricing: {
                        id: product.pricing_id.id,
                        discount: product.pricing_id.discount,
                        cycles: {
                            id: product.pricing_id.cycles_id.id,
                            unit: product.pricing_id.cycles_id.unit,
                            value: product.pricing_id.cycles_id.value,
                            display_name: product.pricing_id.cycles_id.display_name,
                        },
                    },
                };

                if (product.partner_service_id) {
                    data.partner_service = {
                        discount: partner_discount,
                        id: product.partner_service_id.id,
                        service_register: product.partner_service_id.service_register,
                    };
                }

                if (product.coupon_id) {
                    const coupon = {
                        id: product.coupon_id.id,
                        code: product.coupon_id.code,
                        description: product.coupon_id.description,
                        discount_type: product.coupon_id.discount_type,
                        discount_value: product.coupon_id.discount_value,
                    };

                    coupons.push(coupon);
                    data.coupon = coupon;
                }

                return data;
            }),
        );

        res.status(200).json({
            data,
            coupons,
            status: 200,
            bonus_point,
            total_price,
            total_payment,
        });
    } catch (error) {
        configCreateLog('controllers/my/cart/get.log', 'controlUserGetCart', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetCart };
