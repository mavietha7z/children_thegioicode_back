import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { OrderSource } from '~/models/orderSource';
import { CartProduct } from '~/models/cartProduct';
import { OrderTemplate } from '~/models/orderTemplate';
import { serverUserCalculateExpired } from './calculate';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { servicePartnerRenew, servicePartnerRenewInfo } from '../partner/cloudServer';
import { serviceUserPaymentOrderRegisterCloudServer } from '../my/order/payment/cloudServer';

const serviceUserPaymentOrderOrInvoice = async (product, order, invoice) => {
    try {
        if (product.module === 'buy') {
            if (product.product_type === 'Source') {
                await new OrderSource({
                    user_id: order.user_id,
                    source_id: product.product_id._id,
                    invoice_id: invoice.id,
                    unit_price: product.unit_price,
                    quantity: product.quantity,
                    cycles: product.cycles,
                    discount: product.discount,
                    total_price: product.total_price,
                    data_url: product.product_id.data_url,
                    bonus_point: invoice.bonus_point,
                    status: 'completed',
                    description: '',
                }).save();
            }
        }

        if (product.module === 'register') {
            if (product.product_type === 'CloudServerProduct') {
                const result = await serviceUserPaymentOrderRegisterCloudServer(product.cart_product_id, invoice);
                if (!result.success) {
                    return { success: result.success, status: result.status, error: result.error };
                }
            }
        }

        if (product.module === 'renew') {
            const expired_at = serverUserCalculateExpired(
                product.product_id.expired_at,
                product.pricing_id.cycles_id.unit,
                product.pricing_id.cycles_id.value,
            );
            if (!expired_at) {
                return { success: false, status: 400, error: 'Lỗi tính toán chu kỳ sử dụng' };
            }

            if (product.product_type === 'OrderTemplate') {
                const order = await OrderTemplate.findById(product.product_id._id);
                if (!order) {
                    return { success: false, status: 400, error: 'Không tìm thấy đơn tạo website cần gia hạn' };
                }

                order.expired_at = expired_at;
                order.updated_at = Date.now();
                order.pricing_id = product.pricing_id._id;
                order.invoice_id = [...order.invoice_id, invoice.id];
                order.total_price = order.total_price + product.unit_price;
                order.total_payment = order.total_payment + product.total_price;
                order.bonus_point = order.bonus_point + product.pricing_id.bonus_point;

                await order.save();
            }

            if (product.product_type === 'OrderCloudServer') {
                const order = await OrderCloudServer.findById(product.product_id._id);
                if (!order) {
                    return { success: false, status: 400, error: 'Không tìm thấy đơn máy chủ cần gia hạn' };
                }

                const pricing = await Pricing.findById(product.pricing_id._id)
                    .populate({ path: 'service_id' })
                    .populate({ path: 'cycles_id' });
                if (!pricing) {
                    return { success: false, status: 404, error: 'Không tìm thấy đơn giá cần gia hạn' };
                }

                const renewInfo = await servicePartnerRenewInfo(order.order_info.order_id);
                if (renewInfo.status !== 200) {
                    return { success: false, status: 400, error: renewInfo.error };
                }

                const pricingRenew = renewInfo.data.find((price) => price.id === pricing.partner_id);
                if (!pricingRenew) {
                    return { success: false, status: 400, error: 'Chu kỳ muốn gia hạn với đối tác không tồn tại' };
                }

                const dataPost = {
                    pricing_id: pricing.partner_id,
                    order_id: order.order_info.order_id,
                };

                const result = await servicePartnerRenew(dataPost);
                if (result.status !== 200) {
                    return { success: false, status: 400, error: result.error };
                }

                if (order.status === 'expired') {
                    order.status = 'activated';
                }

                order.expired_at = expired_at;
                order.updated_at = Date.now();
                order.invoice_id = [...order.invoice_id, invoice.id];
                order.override_price = order.override_price + product.unit_price;

                await order.save();
            }
        }

        if (product.cart_product_id) {
            await CartProduct.findByIdAndDelete(product.cart_product_id);
            product.cart_product_id = null;
        }

        return { success: true, status: 200 };
    } catch (error) {
        configCreateLog('services/user/payment.log', 'serviceUserPaymentOrderOrInvoice', error.message);

        return { success: false, status: 400, message: 'Lỗi xử lý hoá đơn thanh toán' };
    }
};

export { serviceUserPaymentOrderOrInvoice };
