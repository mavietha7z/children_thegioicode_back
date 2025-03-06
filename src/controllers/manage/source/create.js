import slug from 'slug';
import { Source } from '~/models/source';
import { configCreateLog } from '~/configs';

const controlAuthCreateSource = async (req, res) => {
    try {
        const { id, email, full_name } = req.user;

        const { title, version, data_url, demo_url, priority, image_url, languages, image_meta, description, view_count, purchase_count } =
            req.body;

        let slug_url = slug(title);

        const isSlug = await Source.findOne({ slug_url }).select('slug_url');
        if (isSlug) {
            let randomSlug = Math.floor(100 + Math.random() * 900);
            slug_url += randomSlug;
        }

        const newSource = await new Source({
            title,
            version,
            priority,
            slug_url,
            data_url,
            demo_url,
            image_url,
            languages,
            image_meta,
            view_count,
            description,
            purchase_count,
            user_id: req.user.id,
        }).save();

        const data = {
            user: {
                _id: id,
                email: email,
                full_name: full_name,
            },
            title,
            version,
            priority,
            view_count,
            pricing: 0,
            purchase_count,
            key: newSource._id,
            status: newSource.status,
            created_at: newSource.created_at,
            updated_at: newSource.updated_at,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới mã nguồn #${newSource.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/source/create.log', 'controlAuthCreateSource', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateSource };
