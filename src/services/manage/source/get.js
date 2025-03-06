import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';

const serviceAuthGetSources = async (sources = []) => {
    try {
        const data = await Promise.all(
            sources.map(async (source) => {
                const {
                    id,
                    title,
                    status,
                    version,
                    priority,
                    data_url,
                    demo_url,
                    _id: key,
                    slug_url,
                    category,
                    image_url,
                    languages,
                    view_count,
                    created_at,
                    updated_at,
                    image_meta,
                    description,
                    user_id: user,
                    purchase_count,
                } = source;

                const pricing = await Pricing.countDocuments({ service_id: key, service_type: 'Source' });

                return {
                    id,
                    key,
                    user,
                    title,
                    status,
                    pricing,
                    version,
                    category,
                    priority,
                    slug_url,
                    data_url,
                    demo_url,
                    image_url,
                    languages,
                    view_count,
                    updated_at,
                    created_at,
                    image_meta,
                    description,
                    purchase_count,
                };
            }),
        );

        return data;
    } catch (error) {
        configCreateLog('services/manage/source/get.log', 'serviceAuthGetSources', error.message);

        return [];
    }
};

export { serviceAuthGetSources };
