import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { Template } from '~/models/template';

const controlUserGetTemplates = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Template.countDocuments({ status: true });
        const pages = Math.ceil(count / pageSize);

        const templates = await Template.find({ status: true })
            .select('id title version slug_url image_url view_count created_at create_count status')
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const result = await Promise.all(
            templates.map(async (template) => {
                const pricingLowest = await Pricing.findOne({ status: true, service_id: template._id })
                    .select('price cycles_id')
                    .populate({
                        path: 'cycles_id',
                        select: 'value unit display_name',
                    })
                    .sort({ price: 1 });

                const pricingPromotion = await Pricing.findOne({ status: true, service_id: template._id })
                    .select('discount')
                    .sort({ discount: -1 });

                return {
                    id: template.id,
                    title: template.title,
                    version: template.version,
                    slug_url: template.slug_url,
                    image_url: template.image_url,
                    view_count: template.view_count,
                    created_at: template.created_at,
                    create_count: template.create_count,
                    pricing: {
                        price: pricingLowest.price,
                        discount: pricingPromotion.discount,
                        cycles: {
                            unit: pricingLowest.cycles_id.unit,
                            value: pricingLowest.cycles_id.value,
                            display_name: pricingLowest.cycles_id.display_name,
                        },
                    },
                };
            }),
        );

        const data = result.filter((item) => item !== null);

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/template/get.log', 'controlUserGetTemplates', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserGetTemplateBySlug = async (req, res) => {
    try {
        const { slug_url } = req.params;
        if (!slug_url) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const template = await Template.findOne({ status: true, slug_url });
        if (!template) {
            return res.status(404).json({
                error: 'Mẫu website cần tìm không tồn tại',
            });
        }

        template.view_count += 1;
        const randomCount = Math.floor(Math.random() * 100);
        if (randomCount < 5) {
            template.create_count += 1;
        }

        await template.save();

        const pricings = await Pricing.find({ service_id: template._id, status: true })
            .populate({
                path: 'cycles_id',
                select: 'id value unit display_name',
            })
            .sort({ price: 1 });

        const pricing = pricings.map((pricing) => {
            return {
                id: pricing.id,
                price: pricing.price,
                discount: pricing.discount,
                other_fees: pricing.other_fees,
                cycles: {
                    id: pricing.cycles_id.id,
                    unit: pricing.cycles_id.unit,
                    value: pricing.cycles_id.value,
                    display_name: pricing.cycles_id.display_name,
                },
            };
        });

        let data = {
            pricing,
            id: template.id,
            title: template.title,
            version: template.version,
            modules: template.modules,
            demo_url: template.demo_url,
            image_url: template.image_url,
            image_meta: template.image_meta,
            view_count: template.view_count,
            description: template.description,
            create_count: template.create_count,
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/template/get.log', 'controlUserGetTemplateBySlug', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetTemplates, controlUserGetTemplateBySlug };
