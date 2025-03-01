import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { ResourceProduct } from '~/models/resourceProduct';
import { ResourceAccount } from '~/models/resourceAccount';

const controlAuthGetResourceProducts = async (req, res) => {
    try {
        const { id, category_id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }
        if (isValidMongoId(category_id)) {
            objectQuery.category_id = category_id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await ResourceProduct.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const products = await ResourceProduct.find(objectQuery)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'category_id', select: 'id title' })
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const data = await Promise.all(
            products.map(async (product) => {
                const {
                    id,
                    title,
                    status,
                    _id: key,
                    priority,
                    image_url,
                    view_count,
                    created_at,
                    updated_at,
                    description,
                    user_id: user,
                    purchase_count,
                    category_id: category,
                } = product;

                const inventory = await ResourceAccount.countDocuments({ product_id: product._id });
                const pricing = await Pricing.countDocuments({ service_id: product._id, service_type: 'ResourceProduct' });

                return {
                    key,
                    id,
                    user,
                    title,
                    status,
                    pricing,
                    category,
                    priority,
                    image_url,
                    inventory,
                    view_count,
                    created_at,
                    updated_at,
                    description,
                    purchase_count,
                };
            }),
        );

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/product/get.log', 'controlAuthGetResourceProducts', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetResourceProducts };
