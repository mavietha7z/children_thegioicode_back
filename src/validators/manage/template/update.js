import { Template } from '~/models/template';
import { validatorAuthCreateTemplate } from './create';

const isValidSlug = (slug) => {
    if (!slug) {
        return false;
    }
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
};

const validatorAuthUpdateTemplate = async (req, res, next) => {
    const { slug_url } = req.body;
    const { id, type } = req.query;

    if (!['status', 'info'].includes(type)) {
        return res.status(400).json({
            error: 'Tham số truy vấn không hợp lệ',
        });
    }

    if (type === 'status') {
        return next();
    }

    validatorAuthCreateTemplate(req, res, async () => {
        if (!slug_url || !isValidSlug(slug_url)) {
            return res.status(400).json({
                error: 'Đường dẫn seo không hợp lệ',
            });
        }

        const isSlug = await Template.findOne({ slug_url, _id: { $ne: id } });
        if (isSlug) {
            return res.status(400).json({
                error: 'Đường dẫn seo đã tồn tại',
            });
        }

        next();
    });
};

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const validatorAuthUpdateOrderTemplate = async (req, res, next) => {
    const { status, app_domain, email_admin, admin_domain, password_admin } = req.body;

    if (!['activated', 'wait_confirm', 'pending', 'inactivated', 'expired', 'blocked', 'deleted'].includes(status)) {
        return res.status(400).json({
            error: 'Trạng thái đơn không hợp lệ',
        });
    }
    if (!app_domain) {
        return res.status(400).json({
            error: 'Tên miền website là trường bắt buộc',
        });
    }
    if (!emailRegex.test(email_admin)) {
        return res.status(400).json({
            error: 'Tài khoản quản trị phải là email',
        });
    }
    if (!admin_domain) {
        return res.status(400).json({
            error: 'Tên miền quản trị là trường bắt buộc',
        });
    }
    if (!password_admin || password_admin.length < 6 || password_admin.length > 30) {
        return res.status(400).json({
            error: 'Mật khẩu quản trị không hợp lệ',
        });
    }

    next();
};

export { validatorAuthUpdateTemplate, validatorAuthUpdateOrderTemplate };
