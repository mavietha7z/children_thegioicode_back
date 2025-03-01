import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { ResourceAccount } from '~/models/resourceAccount';
import { ResourceProduct } from '~/models/resourceProduct';

const controlAuthDestroyResourceProduct = async (req, res) => {
    try {
        const { id: service_id } = req.query;

        const product = await ResourceProduct.findByIdAndDelete(service_id);
        if (!product) {
            return res.status(404).json({ error: 'Loại tài khoản cần xoá không tồn tại' });
        }

        await ResourceAccount.deleteMany({ product_id: product._id });
        await Pricing.deleteMany({ service_id: product._id, service_type: 'ResourceProduct' });

        res.status(200).json({
            status: 200,
            message: `Xoá loại tài khoản #${product.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/product/destroy.log', 'controlAuthDestroyResourceProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyResourceProduct };
