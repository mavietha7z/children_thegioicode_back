import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { Template } from '~/models/template';
import { OrderTemplate } from '~/models/orderTemplate';

const controlAuthUpdateTemplate = async (req, res) => {
    try {
        const { id, type } = req.query;

        const template = await Template.findById(id);
        if (!template) {
            return res.status(404).json({ error: 'Template cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            template.status = !template.status;

            data = true;
            message = 'Bật/Tắt trạng thái template thành công';
        }

        if (type === 'info') {
            const { image_url, image_meta, modules, title, slug_url, demo_url, version, priority, view_count, create_count, description } =
                req.body;

            template.title = title;
            template.modules = modules;
            template.version = version;
            template.slug_url = slug_url;
            template.demo_url = demo_url;
            template.priority = priority;
            template.image_url = image_url;
            template.view_count = view_count;
            template.image_meta = image_meta;
            template.description = description;
            template.create_count = create_count;

            const pricing = await Pricing.countDocuments({ service_id: id, service_type: 'Template' });

            message = `Cập nhật template #${template.id} thành công`;
            data = {
                title,
                key: id,
                version,
                modules,
                pricing,
                slug_url,
                demo_url,
                priority,
                image_url,
                view_count,
                image_meta,
                description,
                create_count,
                id: template.id,
                updated_at: Date.now(),
                status: template.status,
                created_at: template.created_at,
            };
        }

        template.updated_at = Date.now();
        await template.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/template/update.log', 'controlAuthUpdateTemplate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthUpdateOrderTemplate = async (req, res) => {
    try {
        const { id } = req.query;
        const { status, app_domain, email_admin, admin_domain, password_admin, description } = req.body;

        const orderTemplate = await OrderTemplate.findById(id)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'template_id', select: 'id title' })
            .populate({
                path: 'pricing_id',
                select: 'id price discount other_fees bonus_point status cycles_id',
                populate: { path: 'cycles_id', select: 'id value unit display_name' },
            });

        if (!orderTemplate) {
            return res.status(404).json({ error: 'Đơn tạo website cần cập nhật không tồn tại' });
        }
        if (orderTemplate.status === 'wait_confirm') {
            return res.status(400).json({ error: 'Đơn tạo website đang chờ khách hàng xác nhận' });
        }
        if (status === 'expired' && new Date() < new Date(orderTemplate.expired_at)) {
            return res.status(400).json({ error: 'Thời gian sử dụng chưa hết hạn không thể cập nhật trạng thái hết hạn' });
        }

        orderTemplate.status = status;
        orderTemplate.updated_at = Date.now();
        orderTemplate.app_domain = app_domain;
        orderTemplate.description = description;
        orderTemplate.email_admin = email_admin;
        orderTemplate.admin_domain = admin_domain;
        orderTemplate.password_admin = password_admin;
        await orderTemplate.save();

        const data = {
            status,
            id: orderTemplate.id,
            key: orderTemplate._id,
            updated_at: Date.now(),
            user: orderTemplate.user_id,
            pricing: orderTemplate.pricing_id,
            template: orderTemplate.template_id,
            invoice_id: orderTemplate.invoice_id,
            auto_renew: orderTemplate.auto_renew,
            created_at: orderTemplate.created_at,
            expired_at: orderTemplate.expired_at,
            app_domain: orderTemplate.app_domain,
            cloudflare: orderTemplate.cloudflare,
            total_price: orderTemplate.total_price,
            bonus_point: orderTemplate.bonus_point,
            email_admin: orderTemplate.email_admin,
            description: orderTemplate.description,
            admin_domain: orderTemplate.admin_domain,
            total_payment: orderTemplate.total_payment,
            password_admin: orderTemplate.password_admin,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Cập nhật đơn tạo website #${orderTemplate.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/template/update.log', 'controlAuthUpdateOrderTemplate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateTemplate, controlAuthUpdateOrderTemplate };
