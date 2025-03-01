import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { ResourceAccount } from '~/models/resourceAccount';
import { ResourceProduct } from '~/models/resourceProduct';
import { ResourceCategory } from '~/models/resourceCategory';

const controlAuthDestroyResourceCategory = async (req, res) => {
    try {
        const { id: category_id } = req.query;

        const category = await ResourceCategory.findById(category_id);
        if (!category) {
            return res.status(404).json({ error: 'Danh mục tài khoản cần xoá không tồn tại' });
        }

        const products = await ResourceProduct.find({ category_id });
        if (products.length > 0) {
            const productIds = products.map((product) => product._id);

            await Promise.all([
                ResourceAccount.deleteMany({ product_id: { $in: productIds } }),
                Pricing.deleteMany({ service_id: { $in: productIds }, service_type: 'ResourceProduct' }),
            ]);

            await ResourceProduct.deleteMany({ category_id });
        }

        await category.deleteOne();

        res.status(200).json({
            status: 200,
            message: `Xoá danh mục tài khoản #${category.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/category/destroy.log', 'controlAuthDestroyResourceCategory', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyResourceCategory };
