import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlAuthDestroyCloudServerProduct = async (req, res) => {
    try {
        const { id } = req.query;

        const product = await CloudServerProduct.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                error: 'Cấu hình cần xoá không tồn tại',
            });
        }

        await Pricing.deleteMany({ service_id: id, service_type: 'CloudServerProduct' });

        res.status(200).json({
            status: 200,
            message: `Xoá cấu hình #${product.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/product/destroy.log', 'controlAuthDestroyCloudServerProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCloudServerProduct };
