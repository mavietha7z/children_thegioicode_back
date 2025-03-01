import { Cart } from '~/models/cart';
import { Order } from '~/models/order';
import { CartProduct } from '~/models/cartProduct';
import { configCreateLog, configGetDiscountRulePartner } from '~/configs';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';

const controlUserPaymentCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.user.id, status: true });
        if (!cart) {
            return res.status(404).json({ error: 'Giỏ hàng của bạn không tồn tại hoặc đã bị khoá' });
        }

        const products = await CartProduct.find({ user_id: req.user.id, cart_id: cart._id, status: 'pending' })
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'product_id', select: 'id title data_url' })
            .populate({
                path: 'pricing_id',
                populate: { path: 'cycles_id' },
            })
            .populate({ path: 'partner_service_id', select: 'id discount_rules service_register' })
            .populate({ path: 'coupon_id', select: 'id code discount_type discount_value description' })
            .sort({ created_at: -1 });

        let coupons = [];
        let total_price = 0;
        let bonus_point = 0;
        let total_payment = 0;
        let productsOrder = [];
        let productsInvoice = [];
        let recurring_type = null;

        for (const product of products) {
            let partnerDiscount = 0;

            if (product.partner_service_id) {
                partnerDiscount = configGetDiscountRulePartner(
                    product.partner_service_id.service_register,
                    product.partner_service_id.discount_rules,
                );
            }

            // Áp dụng partnerDiscount trước
            const priceAfterPartnerDiscount = product.pricing_id.price * (1 - partnerDiscount / 100);
            let priceAfterDiscount = priceAfterPartnerDiscount;

            if (product.coupon_id) {
                coupons.push({
                    code: product.coupon_id.code,
                    description: product.coupon_id.description,
                    discount_type: product.coupon_id.discount_type,
                    discount_value: product.coupon_id.discount_value,
                });

                if (product.coupon_id.discount_type === 'percentage') {
                    priceAfterDiscount = priceAfterPartnerDiscount * (1 - product.coupon_id.discount_value / 100);
                } else if (product.coupon_id.discount_type === 'fixed') {
                    priceAfterDiscount = priceAfterPartnerDiscount - product.coupon_id.discount_value;
                }
            } else {
                priceAfterDiscount = priceAfterPartnerDiscount * (1 - product.pricing_id.discount / 100);
            }

            const discountedPrice = priceAfterDiscount * product.quantity;

            let totalPrice = discountedPrice;
            if (product.module === 'register') {
                totalPrice = discountedPrice + product.pricing_id.creation_fee;
            }
            if (product.module === 'renew') {
                totalPrice = discountedPrice + product.pricing_id.renewal_fee;
            }
            if (product.module === 'upgrade') {
                totalPrice = discountedPrice + product.pricing_id.upgrade_fee;
            }

            total_payment += totalPrice;
            total_price += product.pricing_id.price * product.quantity;
            bonus_point += product.pricing_id.bonus_point * product.quantity;

            const totalDiscountPercent = ((product.pricing_id.price - totalPrice) / product.pricing_id.price) * 100;

            productsOrder.push({
                quantity: product.quantity,
                title: product.title,
                description: product.description,
                unit_price: product.pricing_id.price,
                discount: totalDiscountPercent,
                cycles: product.pricing_id.cycles_id.display_name,
                data_url: product.product_id.data_url || null,
                total_price: totalPrice,
                product_id: product.product_id._id,
                product_type: product.product_type,
                pricing_id: product.pricing_id._id,
                module: product.module,
                cart_product_id: product._id,
            });

            let fees = 0;
            if (product.module === 'register') {
                fees = product.pricing_id.creation_fee;
            }
            if (product.module === 'renew') {
                fees = product.pricing_id.renewal_fee;
            }
            if (product.module === 'upgrade') {
                fees = product.pricing_id.upgrade_fee;
            }

            productsInvoice.push({
                title: product.title,
                description: product.description,
                unit_price: product.pricing_id.price,
                quantity: 1,
                fees,
                cycles: product.pricing_id.cycles_id.display_name,
                discount: totalDiscountPercent,
                total_price: totalPrice,
            });

            recurring_type = product.module;

            product.status = 'wait_pay';
            await product.save();
        }

        const newInvoice = await serviceUserCreateNewInvoice(
            req.user.id,
            'service',
            'VND',
            recurring_type,
            productsInvoice,
            coupons,
            bonus_point,
            -total_price,
            -total_payment,
            'app_wallet',
            null,
            '',
            false,
        );
        if (!newInvoice.success) {
            return res.status(400).json({ error: 'Lỗi xử lý hoá đơn thanh toán' });
        }

        const newOrder = await new Order({
            user_id: req.user.id,
            invoice_id: newInvoice.data.id,
            products: productsOrder,
            coupons,
            status: 'pending',
            bonus_point,
            total_price,
            total_payment,
            pay_method: 'app_wallet',
            description: '',
        }).save();

        newInvoice.data.description = `Hoá đơn thanh toán đơn hàng #${newOrder.id}`;
        await newInvoice.data.save();

        res.status(200).json({
            status: 200,
            data: newOrder.id,
            message: `Tạo đơn hàng #${newOrder.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/my/cart/payment.log', 'controlUserPaymentCart', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserPaymentCart };
