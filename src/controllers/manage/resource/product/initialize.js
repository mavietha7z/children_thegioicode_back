import { configCreateLog } from '~/configs';
import { ResourceCategory } from '~/models/resourceCategory';

const controlAuthGetInitializeResourceProduct = async (req, res) => {
    try {
        const categories = await ResourceCategory.find({}).select('title').sort({ priority: 1 });

        const data = categories.map((category) => {
            return {
                id: category._id,
                title: category.title,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/product/initialize.log', 'controlAuthGetInitializeResourceProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetInitializeResourceProduct };
