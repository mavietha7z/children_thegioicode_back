import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { ResourceAccount } from '~/models/resourceAccount';
import { ResourceProduct } from '~/models/resourceProduct';
import { ResourceCategory } from '~/models/resourceCategory';

const controlUserGetResourceCategories = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await ResourceCategory.countDocuments({ status: true });
        const pages = Math.ceil(count / pageSize);

        const categories = await ResourceCategory.find({ status: true })
            .select('id title slug_url image_url priority status description')
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const data = categories.map((categories) => {
            return {
                id: categories.id,
                title: categories.title,
                slug_url: categories.slug_url,
                image_url: categories.image_url,
                priority: categories.priority,
                status: categories.status,
                description: categories.description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/resource/get.log', 'controlUserGetResourceCategories', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserGetResourceCategoryBySlug = async (req, res) => {
    try {
        const { slug_url } = req.params;

        if (!slug_url) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const category = await ResourceCategory.findOne({ slug_url, status: true });
        if (!category) {
            return res.status(404).json({ error: 'Danh mục tài khoản cần tìm không tồn tại' });
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await ResourceProduct.countDocuments({ category_id: category._id, status: true });
        const pages = Math.ceil(count / pageSize);

        const products = await ResourceProduct.find({ category_id: category._id, status: true })
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'category_id', select: 'id title' })
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const data = await Promise.all(
            products.map(async (product) => {
                const inventory = await ResourceAccount.countDocuments({ product_id: product._id, status: true, sold: false });

                const pricing = await Pricing.findOne({ service_id: product._id, service_type: 'ResourceProduct' }).select(
                    'id price discount',
                );

                return {
                    inventory,
                    id: product.id,
                    title: product.title,
                    user: product.user_id,
                    status: product.status,
                    priority: product.priority,
                    image_url: product.image_url,
                    category: product.category_id,
                    view_count: product.view_count,
                    description: product.description,
                    purchase_count: product.purchase_count,
                    pricing: {
                        id: pricing.id,
                        price: pricing.price,
                        discount: pricing.discount,
                    },
                };
            }),
        );

        res.status(200).json({
            data: {
                products: data,
                id: category.id,
                title: category.title,
                slug_url: category.slug_url,
                image_url: category.image_url,
                description: category.description,
            },
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/template/get.log', 'controlUserGetResourceCategoryBySlug', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetResourceCategories, controlUserGetResourceCategoryBySlug };
