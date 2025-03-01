import slug from 'slug';
import { configCreateLog } from '~/configs';
import { ResourceCategory } from '~/models/resourceCategory';

const controlAuthCreateResourceCategory = async (req, res) => {
    try {
        const { title, description, image_url } = req.body;

        let slug_url = slug(title);
        const isSlugS = await ResourceCategory.findOne({ slug_url }).select('slug_url');
        if (isSlugS) {
            let randomDigits = Math.floor(100 + Math.random() * 900);
            slug_url += randomDigits;
        }

        let priority = 0;
        const highestPriority = await ResourceCategory.findOne({}).sort({ priority: -1 });
        if (highestPriority) {
            priority = highestPriority.priority + 1;
        }

        const newCategory = await new ResourceCategory({
            title,
            slug_url,
            priority,
            image_url,
            description,
        }).save();

        const data = {
            title,
            slug_url,
            priority,
            image_url,
            description,
            id: newCategory.id,
            key: newCategory._id,
            status: newCategory.status,
            created_at: newCategory.created_at,
            updated_at: newCategory.updated_at,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới danh mục #${newCategory.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/category/create.log', 'controlAuthCreateResourceCategory', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateResourceCategory };
