import slug from 'slug';
import { configCreateLog } from '~/configs';
import { Template } from '~/models/template';

const controlAuthCreateTemplate = async (req, res) => {
    try {
        const { title, modules, version, demo_url, priority, image_url, image_meta, view_count, description, create_count } = req.body;

        let slug_url = slug(title);

        const isSlugS = await Template.findOne({ slug_url }).select('slug_url');
        if (isSlugS) {
            let randomDigits = Math.floor(100 + Math.random() * 900);
            slug_url += randomDigits;
        }

        const newTemplate = await new Template({
            title,
            modules,
            version,
            slug_url,
            priority,
            demo_url,
            image_url,
            image_meta,
            view_count,
            description,
            create_count,
        }).save();

        const data = {
            title,
            version,
            modules,
            slug_url,
            demo_url,
            priority,
            image_url,
            pricing: 0,
            view_count,
            image_meta,
            description,
            create_count,
            id: newTemplate.id,
            key: newTemplate._id,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: newTemplate.status,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới Template #${newTemplate.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/template/create.log', 'controlAuthCreateTemplate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateTemplate };
