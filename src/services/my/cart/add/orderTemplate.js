import { Cart } from '~/models/cart';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { sendMessageBotTelegramApp } from '~/bot';
import { CartProduct } from '~/models/cartProduct';
import { OrderTemplate } from '~/models/orderTemplate';

const serviceUserAddOrderTemplateToCart = async (user, id) => {
    try {
        const order = await OrderTemplate.findOne({ id, status: 'activated' });
        if (!order) {
            return {
                status: 404,
                success: false,
                error: 'Đơn tạo website không tồn tại hoặc bị chặn',
            };
        }

        const pricing = await Pricing.findOne({ service_id: order.template_id, status: true })
            .populate({ path: 'cycles_id' })
            .sort({ price: 1 });
        if (!pricing) {
            return {
                status: 404,
                success: false,
                error: 'Đơn tạo website không có giá hoặc bị tắt',
            };
        }

        const cart = await Cart.findOne({ user_id: user.id, status: true }).populate({
            path: 'user_id',
            select: 'id email full_name',
        });
        if (!cart) {
            return {
                status: 404,
                success: false,
                error: 'Không tìm thấy giỏ hàng của bạn',
            };
        }

        const isCartProduct = await CartProduct.findOne({
            user_id: user.id,
            product_id: order._id,
            product_type: 'OrderTemplate',
            module: 'renew',
            status: 'pending',
        });

        if (!isCartProduct) {
            await new CartProduct({
                user_id: user.id,
                cart_id: cart._id,
                title: 'Gia hạn đơn tạo website',
                description: `Gia hạn đơn tạo website #${order.id} thời gian ${pricing.cycles_id.display_name}`,
                module: 'renew',
                product_id: order._id,
                product_type: 'OrderTemplate',
                pricing_id: pricing._id,
                quantity: 1,
                status: 'pending',
            }).save();
        }

        // Bot telegram
        sendMessageBotTelegramApp(`Khác hàng: \n ${user.email} \n ${user.full_name} \n\n Thêm đơn OrderTemplate #${order.id} vào giỏ hàng`);

        return {
            status: 200,
            success: true,
            message: 'Thêm vào giỏ hàng thành công',
        };
    } catch (error) {
        configCreateLog('services/my/cart/add/orderTemplate.log', 'serviceUserAddOrderTemplateToCart', error.message);
        return {
            status: 400,
            success: false,
            error: 'Thêm vào giỏ hàng thất bại',
        };
    }
};

export { serviceUserAddOrderTemplateToCart };
