import { configCreateLog } from '~/configs';
import { ResourceCategory } from '~/models/resourceCategory';

const controlAuthUpdateResourceCategory = async (req, res) => {
    try {
        const { id, type } = req.query;

        const category = await ResourceCategory.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Danh mục tài khoản cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            category.status = !category.status;

            data = true;
            message = 'Bật/Tắt trạng thái danh mục tài khoản thành công';
        }

        if (type === 'info') {
            const { title, slug_url, priority, image_url, description } = req.body;

            category.title = title;
            category.slug_url = slug_url;
            category.priority = priority;
            category.image_url = image_url;
            category.description = description;

            message = `Cập nhật danh mục tài khoản #${category.id} thành công`;
            data = {
                title,
                key: id,
                slug_url,
                priority,
                image_url,
                description,
                id: category.id,
                updated_at: Date.now(),
                status: category.status,
                created_at: category.created_at,
            };
        }

        category.updated_at = Date.now();
        await category.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/category/update.log', 'controlAuthUpdateResourceCategory', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateResourceCategory };
