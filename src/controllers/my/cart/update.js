import { Cart } from '~/models/cart';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { sendMessageBotTelegramApp } from '~/bot';
import { CartProduct } from '~/models/cartProduct';

const controlUserClearCart = async (req, res) => {
    try {
        const data = req.body;

        await CartProduct.deleteMany({ id: { $in: data } });

        // Bot telegram
        sendMessageBotTelegramApp(`Khác hàng: \n ${req.user.email} \n ${req.user.full_name} \n\n Xoá đơn hàng trong giỏ hàng thành công`);

        res.status(200).json({
            status: 200,
            message: 'Xoá sản phẩm giỏ hàng thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/cart/update.log', 'controlUserClearCart', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserChangeCycles = async (req, res) => {
    try {
        const { pricing_id, product_id } = req.body;
        if (!isValidDataId(pricing_id) || !isValidDataId(product_id)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const cart = await Cart.findOne({ user_id: req.user.id, status: true });
        if (!cart) {
            return res.status(400).json({ error: 'Giỏ hàng của bạn không tồn tại hoặc bị khoá' });
        }

        const pricing = await Pricing.findOne({ id: pricing_id, status: true }).populate({ path: 'cycles_id' });
        if (!pricing) {
            return res.status(400).json({ error: 'Chu kỳ bạn chọn không tồn tại hoặc bị tắt' });
        }

        const product = await CartProduct.findOne({ id: product_id });
        if (!product) {
            return res.status(400).json({ error: 'Sản phẩm bạn chọn không tồn tại trong giỏ hàng' });
        }

        product.updated_at = Date.now();
        product.pricing_id = pricing._id;

        if (['register', 'renew'].includes(product.module)) {
            function updateMonthDuration(inputString, newMonth) {
                return inputString.replace(/\d+ Tháng/, `${newMonth} Tháng`);
            }

            product.coupon_id = null;
            product.description = updateMonthDuration(product.description, pricing.cycles_id.value);
        }

        await product.save();

        res.status(200).json({
            status: 200,
            message: 'Cập nhật chu kỳ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/cart/update.log', 'controlUserChangeCycles', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserClearCart, controlUserChangeCycles };
