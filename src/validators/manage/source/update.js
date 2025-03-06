import { Source } from '~/models/source';
import { validatorAuthCreateSource } from './create';

const isValidSlug = (slug) => {
    if (!slug) {
        return false;
    }
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
};

const validatorAuthUpdateSource = async (req, res, next) => {
    const { slug_url } = req.body;
    const { id, type } = req.query;

    if (!['status', 'info'].includes(type)) {
        return res.status(400).json({
            error: 'Tham số truy vấn không hợp lệ',
        });
    }

    if (['status'].includes(type)) {
        return next();
    }

    validatorAuthCreateSource(req, res, async () => {
        if (!slug_url || !isValidSlug(slug_url)) {
            return res.status(400).json({
                error: 'Đường dẫn SEO không hợp lệ',
            });
        }

        const isSlug = await Source.findOne({ slug_url, _id: { $ne: id } });
        if (isSlug) {
            return res.status(400).json({
                error: 'Đường dẫn SEO đã tồn tại',
            });
        }

        next();
    });
};

export { validatorAuthUpdateSource };
