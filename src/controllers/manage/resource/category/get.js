import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { ResourceCategory } from '~/models/resourceCategory';

const controlAuthGetResourceCategories = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await ResourceCategory.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const categories = await ResourceCategory.find(objectQuery).skip(skip).limit(pageSize).sort({ priority: 1 });

        const data = categories.map((category) => {
            const { _id: key, id, title, slug_url, priority, image_url, status, description, created_at, updated_at } = category;

            return {
                id,
                key,
                title,
                slug_url,
                priority,
                status,
                description,
                image_url,
                created_at,
                updated_at,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/category/get.log', 'controlAuthGetResourceCategories', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetResourceCategories };
