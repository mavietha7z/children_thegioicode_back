import { Source } from '~/models/source';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';

const controlAuthUpdateSource = async (req, res) => {
    try {
        const { id, type } = req.query;

        const source = await Source.findById(id).populate({ path: 'user_id', select: 'full_name email' });
        if (!source) {
            return res.status(404).json({
                error: 'Mã nguồn cần cập nhật không tồn tại',
            });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            source.status = !source.status;

            data = true;
            message = 'Bật/Tắt trạng thái mã nguồn thành công';
        }

        if (type === 'info') {
            const {
                title,
                version,
                slug_url,
                data_url,
                demo_url,
                priority,
                image_url,
                view_count,
                image_meta,
                description,
                purchase_count,
            } = req.body;

            source.title = title;
            source.version = version;
            source.slug_url = slug_url;
            source.data_url = data_url;
            source.demo_url = demo_url;
            source.priority = priority;
            source.image_url = image_url;
            source.view_count = view_count;
            source.image_meta = image_meta;
            source.description = description;
            source.purchase_count = purchase_count;

            const { user_id: user, created_at } = source;
            const pricing = await Pricing.countDocuments({ service_id: id, service_type: 'Source' });

            data = {
                user,
                title,
                pricing,
                key: id,
                version,
                priority,
                slug_url,
                data_url,
                demo_url,
                image_url,
                view_count,
                created_at,
                image_meta,
                description,
                id: source.id,
                purchase_count,
                status: source.status,
                updated_at: Date.now(),
                category: source.category,
                languages: source.languages,
            };
            message = `Cập nhật mã nguồn ${source.id} thành công`;
        }

        source.updated_at = Date.now();
        await source.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/source/update.log', 'controlAuthUpdateSource', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateSource };
