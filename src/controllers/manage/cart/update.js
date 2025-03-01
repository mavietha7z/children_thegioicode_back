import { Cart } from '~/models/cart';
import { configCreateLog } from '~/configs';

const controlAuthUpdateCartUser = async (req, res) => {
    try {
        const { id, type } = req.query;

        if (!['status'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const cart = await Cart.findById(id);
        if (!cart) {
            return res.status(404).json({ error: 'Không tìm thấy giỏ hàng thành viên' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            cart.status = !cart.status;

            data = !cart.status;
            message = 'Bật/Tắt trạng thái giỏ hàng thành viên thành công';
        }

        cart.updated_at = Date.now();
        await cart.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cart/update.log', 'controlAuthUpdateCartUser', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateCartUser };
