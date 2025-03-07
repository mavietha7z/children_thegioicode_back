import { Cart } from '~/models/cart';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';

const serviceUserAddCloudServerToCart = async (user, body, validate) => {
    try {
        const { display_name } = body;
        const { plan, image, region, pricing, product } = validate;

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

        for (let i = 0; i < display_name.length; i++) {
            const displayName = display_name[i];

            await new CartProduct({
                user_id: user.id,
                cart_id: cart._id,
                title: 'Đăng ký Cloud Server',
                description: `Đăng ký Cloud Server ${image.title} thời gian ${pricing.cycles_id.display_name}`,
                module: 'register',
                product_id: product._id,
                product_type: 'CloudServerProduct',
                pricing_id: pricing._id,
                quantity: 1,
                coupon_id: null,
                region_id: region._id,
                image_id: image._id,
                plan: {
                    id: plan.id,
                    title: plan.title,
                    image_url: plan.image_url,
                    description: plan.description,
                },
                display_name: displayName,
                additional_services: [],
                status: 'pending',
            }).save();
        }

        return {
            status: 200,
            success: true,
            message: 'Thêm vào giỏ hàng thành công',
        };
    } catch (error) {
        configCreateLog('services/my/cart/add/cloudServer.log', 'serviceUserAddCloudServerToCart', error.message);
        return {
            status: 400,
            success: false,
            error: 'Thêm vào giỏ hàng thất bại',
        };
    }
};

export { serviceUserAddCloudServerToCart };
