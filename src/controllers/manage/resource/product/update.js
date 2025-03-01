import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { ResourceProduct } from '~/models/resourceProduct';
import { ResourceAccount } from '~/models/resourceAccount';

const controlAuthUpdateResourceProduct = async (req, res) => {
    try {
        const { id, type } = req.query;

        const product = await ResourceProduct.findById(id)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'category_id', select: 'id title' });
        if (!product) {
            return res.status(404).json({ error: 'Loại tài khoản cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            product.status = !product.status;

            data = true;
            message = 'Bật/Tắt trạng thái loại tài khoản thành công';
        }

        if (type === 'info') {
            const { title, priority, image_url, description, purchase_count, view_count } = req.body;

            product.title = title;
            product.priority = priority;
            product.image_url = image_url;
            product.view_count = view_count;
            product.description = description;
            product.purchase_count = purchase_count;

            const inventory = await ResourceAccount.countDocuments({ product_id: product._id });
            const pricing = await Pricing.countDocuments({ service_id: product._id, service_type: 'ResourceProduct' });

            message = `Cập nhật loại tài khoản #${product.id} thành công`;
            data = {
                title,
                pricing,
                key: id,
                priority,
                inventory,
                image_url,
                view_count,
                description,
                purchase_count,
                id: product.id,
                user: product.user_id,
                updated_at: Date.now(),
                status: product.status,
                category: product.category_id,
                created_at: product.created_at,
            };
        }

        product.updated_at = Date.now();
        await product.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/product/update.log', 'controlAuthUpdateResourceProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateResourceProduct };
