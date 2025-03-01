import { configCreateLog } from '~/configs';
import { ResourceProduct } from '~/models/resourceProduct';

const controlAuthGetInitializeResourceAccount = async (req, res) => {
    try {
        const products = await ResourceProduct.find({}).select('title').sort({ priority: 1 });

        const data = products.map((product) => {
            return {
                id: product._id,
                title: product.title,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/account/initialize.log', 'controlAuthGetInitializeResourceAccount', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetInitializeResourceAccount };
