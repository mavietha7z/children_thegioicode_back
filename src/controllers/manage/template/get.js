import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { Template } from '~/models/template';
import { isValidMongoId } from '~/validators';
import { OrderTemplate } from '~/models/orderTemplate';

const controlAuthGetTemplates = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Template.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const templates = await Template.find(objectQuery).skip(skip).limit(pageSize).sort({ priority: 1 });

        const data = await Promise.all(
            templates.map(async (template) => {
                const {
                    id,
                    title,
                    status,
                    version,
                    modules,
                    _id: key,
                    slug_url,
                    priority,
                    demo_url,
                    image_url,
                    view_count,
                    updated_at,
                    created_at,
                    image_meta,
                    description,
                    create_count,
                } = template;

                const pricing = await Pricing.countDocuments({ service_id: key, service_type: 'Template' });

                return {
                    id,
                    key,
                    title,
                    status,
                    version,
                    modules,
                    pricing,
                    slug_url,
                    demo_url,
                    priority,
                    image_url,
                    view_count,
                    created_at,
                    updated_at,
                    image_meta,
                    description,
                    create_count,
                };
            }),
        );

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/template/get.log', 'controlAuthGetTemplates', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthGetOrdersTemplates = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await OrderTemplate.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const orderTemplates = await OrderTemplate.find({})
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'template_id', select: 'id title' })
            .populate({
                path: 'pricing_id',
                select: 'id price discount other_fees bonus_point status cycles_id',
                populate: { path: 'cycles_id', select: 'id value unit display_name' },
            })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = orderTemplates.map((orderTemplate) => {
            const {
                id,
                status,
                _id: key,
                invoice_id,
                auto_renew,
                created_at,
                updated_at,
                expired_at,
                cloudflare,
                app_domain,
                bonus_point,
                total_price,
                email_admin,
                description,
                admin_domain,
                user_id: user,
                total_payment,
                password_admin,
                pricing_id: pricing,
                template_id: template,
            } = orderTemplate;

            return {
                id,
                key,
                user,
                status,
                pricing,
                template,
                invoice_id,
                auto_renew,
                created_at,
                updated_at,
                expired_at,
                cloudflare,
                app_domain,
                total_price,
                bonus_point,
                email_admin,
                description,
                admin_domain,
                total_payment,
                password_admin,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/template/get.log', 'controlAuthGetOrdersTemplates', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetTemplates, controlAuthGetOrdersTemplates };
