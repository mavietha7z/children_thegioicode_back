import { Cart } from '~/models/cart';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const serviceUserAddOrderInstanceToCart = async (user, id) => {
    try {
        const result = await serviceUserVerifyTokenPartner('CloudServer', user.id);
        if (!result.success) {
            return {
                status: 40,
                success: false,
                error: result.error,
            };
        }

        const order = await OrderCloudServer.findOne({ id });
        if (!order) {
            return {
                status: 404,
                success: false,
                error: 'Đơn máy chủ không tồn tại hoặc bị chặn',
            };
        }

        const product = await CloudServerProduct.findById(order.product_id);
        if (!product) {
            return {
                status: 404,
                success: false,
                error: 'Cấu hình này không còn hoặc đã bị tắt',
            };
        }

        const pricing = await Pricing.findOne({ service_id: product._id, status: true }).populate({ path: 'cycles_id' }).sort({ price: 1 });
        if (!pricing) {
            return {
                status: 404,
                success: false,
                error: 'Đơn máy chủ không có giá hoặc bị tắt',
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
            product_type: 'OrderCloudServer',
            module: 'renew',
            status: 'pending',
        });
        if (!isCartProduct) {
            await new CartProduct({
                user_id: user.id,
                cart_id: cart._id,
                title: 'Gia hạn Cloud Server',
                description: `Gia hạn Cloud Server #${order.id} thời gian ${pricing.cycles_id.display_name}`,
                module: 'renew',
                product_id: order._id,
                product_type: 'OrderCloudServer',
                pricing_id: pricing._id,
                quantity: 1,
                status: 'pending',
            }).save();
        }

        return {
            status: 200,
            success: true,
            message: 'Thêm vào giỏ hàng thành công',
        };
    } catch (error) {
        configCreateLog('services/my/cart/add/orderInstance.log', 'serviceUserAddOrderInstanceToCart', error.message);
        return {
            status: 400,
            success: false,
            error: 'Thêm vào giỏ hàng thất bại',
        };
    }
};

export { serviceUserAddOrderInstanceToCart };
