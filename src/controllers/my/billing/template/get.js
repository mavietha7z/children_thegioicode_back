import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderTemplate } from '~/models/orderTemplate';

const controlUserBillingGetTemplates = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await OrderTemplate.countDocuments({ user_id: req.user.id });
        const pages = Math.ceil(count / pageSize);

        const results = await OrderTemplate.find({ user_id: req.user.id })
            .populate({ path: 'template_id' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const startIndex = (req.page - 1) * pageSize + 1;

        const data = results.map((result, index) => {
            return {
                id: result.id,
                status: result.status,
                index: startIndex + index,
                domain: result.app_domain,
                auto_renew: result.auto_renew,
                created_at: result.created_at,
                expired_at: result.expired_at,
                total_price: result.total_price,
                template: {
                    id: result.template_id.id,
                    title: result.template_id.title,
                    slug_url: result.template_id.slug_url,
                },
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/template/get.log', 'controlUserBillingGetTemplates', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserBillingGetTemplateDetail = async (req, res) => {
    try {
        const { template_id } = req.params;

        if (!isValidDataId(template_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const template = await OrderTemplate.findOne({ user_id: req.user.id, id: template_id }).populate({ path: 'template_id' });

        if (!template) {
            return res.status(404).json({
                error: `Đơn hàng #${template_id} không tồn tại`,
            });
        }

        let data = {
            id: template.id,
            status: template.status,
            discount: template.discount,
            auto_renew: template.auto_renew,
            created_at: template.created_at,
            expired_at: template.expired_at,
            bonus_point: template.bonus_point,
            total_price: template.total_price,
            description: template.description,
            total_payment: template.total_payment,
            template: {
                id: template.template_id.id,
                title: template.template_id.title,
                slug_url: template.template_id.slug_url,
            },
            app_domain: template.app_domain,
            email_admin: template.email_admin,
            admin_domain: template.admin_domain,
            password_admin: template.password_admin,
        };

        if (template.status === 'wait_confirm') {
            data.cloudflare = {
                status: template.cloudflare.status,
                name_servers: template.cloudflare.name_servers,
                original_name_servers: template.cloudflare.original_name_servers,
            };
        }

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/template/get.log', 'controlUserBillingGetTemplateDetail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserBillingGetTemplates, controlUserBillingGetTemplateDetail };
