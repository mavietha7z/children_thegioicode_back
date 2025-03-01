import { configCreateLog } from '~/configs';
import { ResourceProduct } from '~/models/resourceProduct';
import { ResourceCategory } from '~/models/resourceCategory';

const controlAuthCreateResourceProduct = async (req, res) => {
    try {
        const { category_id, title, description, image_url } = req.body;

        const category = await ResourceCategory.findById(category_id).select('id title');
        if (!category) {
            return res.status(404).json({ error: 'Danh mục tài khoản không tồn tại' });
        }

        let priority = 0;
        const highestPriority = await ResourceProduct.findOne({}).sort({ priority: -1 });
        if (highestPriority) {
            priority = highestPriority.priority + 1;
        }

        const newProduct = await new ResourceProduct({
            user_id: req.user.id,
            category_id,
            title,
            priority,
            image_url,
            view_count: 0,
            purchase_count: 0,
            description,
        }).save();

        const data = {
            key: newProduct._id,
            id: newProduct.id,
            user: {
                _id: req.user.id,
                id: req.user.user_id,
                email: req.user.email,
                full_name: req.user.full_name,
            },
            title,
            category,
            priority,
            image_url,
            pricing: 0,
            description,
            inventory: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: newProduct.status,
            view_count: newProduct.view_count,
            purchase_count: newProduct.purchase_count,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới loại tài khoản #${newProduct.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/product/create.log', 'controlAuthCreateResourceProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateResourceProduct };
