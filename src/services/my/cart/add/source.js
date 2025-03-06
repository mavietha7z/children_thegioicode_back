import { Cart } from '~/models/cart';
import { Source } from '~/models/source';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';

const serviceUserAddSourceToCart = async (user, id) => {
    try {
        const source = await Source.findOne({ id, status: true });
        if (!source) {
            return {
                status: 404,
                success: false,
                error: 'Mã nguồn cần thêm không tồn tại hoặc chưa xuất bản',
            };
        }

        const pricing = await Pricing.findOne({ service_id: source._id, status: true }).populate({ path: 'cycles_id' });
        if (!pricing) {
            return {
                status: 404,
                success: false,
                error: 'Mã nguồn không có giá hoặc đã bị tắt',
            };
        }

        const cart = await Cart.findOne({ user_id: user.id }).populate({ path: 'user_id', select: 'id email full_name' });
        if (!cart) {
            return {
                status: 404,
                success: false,
                error: 'Không tìm thấy giỏ hàng của bạn',
            };
        }

        await new CartProduct({
            user_id: user.id,
            cart_id: cart._id,
            title: source.title,
            description: source.title,
            module: 'buy',
            product_id: source._id,
            product_type: 'Source',
            pricing_id: pricing._id,
            quantity: 1,
            status: 'pending',
        }).save();

        source.purchase_count += 1;
        await source.save();

        return {
            status: 200,
            success: true,
            message: 'Thêm vào giỏ hàng thành công',
        };
    } catch (error) {
        configCreateLog('services/my/cart/add/source.log', 'serviceUserAddSourceToCart', error.message);
        return {
            status: 400,
            success: false,
            error: 'Thêm vào giỏ hàng thất bại',
        };
    }
};

export { serviceUserAddSourceToCart };
