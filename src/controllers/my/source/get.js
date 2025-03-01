import { Source } from '~/models/source';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';

const controlUserGetSources = async (req, res) => {
    try {
        const { category } = req.query;

        if (!category || (category !== 'tra-phi' && category !== 'mien-phi')) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Source.countDocuments({ status: true, published: true });
        const pages = Math.ceil(count / pageSize);

        const sources = await Source.find({ status: true, published: true })
            .select('id title status published version slug_url image_url view_count created_at purchase_count')
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const result = await Promise.all(
            sources.map(async (source) => {
                const pricing = await Pricing.findOne({ status: true, service_id: source._id })
                    .select('price discount cycles_id')
                    .populate({
                        path: 'cycles_id',
                        select: 'value unit display_name',
                    });

                if (!pricing) {
                    return null;
                }

                const discountedPrice = pricing.price * (1 - pricing.discount / 100);

                return {
                    id: source.id,
                    title: source.title,
                    version: source.version,
                    slug_url: source.slug_url,
                    image_url: source.image_url,
                    view_count: source.view_count,
                    created_at: source.created_at,
                    purchase_count: source.purchase_count,
                    pricing: {
                        price: discountedPrice,
                        old_price: pricing.price,
                        discount: pricing.discount,
                        cycles: {
                            unit: pricing.cycles_id.unit,
                            value: pricing.cycles_id.value,
                            display_name: pricing.cycles_id.display_name,
                        },
                    },
                };
            }),
        );

        const filteredData = result.filter((item) => item !== null);

        let data = [];
        if (category === 'tra-phi') {
            data = filteredData.filter((item) => item.pricing && item.pricing.price > 0);
        }
        if (category === 'mien-phi') {
            data = filteredData.filter((item) => item.pricing && item.pricing.price === 0);
        }

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/source/get.log', 'controlUserGetSources', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserGetSourceBySlug = async (req, res) => {
    try {
        const { slug_url } = req.params;
        if (!slug_url) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const source = await Source.findOne({ status: true, published: true, slug_url });
        if (!source) {
            return res.status(404).json({
                error: 'Mã nguồn cần tìm không tồn tại',
            });
        }

        source.view_count += 1;
        const randomCount = Math.floor(Math.random() * 100);
        if (randomCount < 10) {
            source.purchase_count += 1;
        }

        await source.save();

        const pricing = await Pricing.findOne({ service_id: source._id }).populate({
            path: 'cycles_id',
            select: 'id value unit display_name',
        });

        const data = {
            id: source.id,
            title: source.title,
            version: source.version,
            category: source.category,
            demo_url: source.demo_url,
            data_url: source.data_url,
            image_url: source.image_url,
            languages: source.languages,
            image_meta: source.image_meta,
            view_count: source.view_count,
            description: source.description,
            purchase_count: source.purchase_count,
            pricing: {
                price: pricing.price,
                discount: pricing.discount,
                other_fees: pricing.other_fees,
                cycles: {
                    id: pricing.cycles_id.id,
                    unit: pricing.cycles_id.unit,
                    value: pricing.cycles_id.value,
                    display_name: pricing.cycles_id.display_name,
                },
            },
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/source/get.log', 'controlUserGetSourceBySlug', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetSources, controlUserGetSourceBySlug };
