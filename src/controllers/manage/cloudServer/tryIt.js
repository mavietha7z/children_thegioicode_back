import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlAuthGetCloudServerTryIt = async (req, res) => {
    try {
        const resultImages = await CloudServerImage.find({ status: true }).select('title group').sort({ group: 1 });
        const images = resultImages.map((image) => {
            return {
                id: image._id,
                title: image.title,
                group: image.group,
            };
        });

        const resultRegions = await CloudServerRegion.find({ status: true })
            .select('title plans')
            .populate({ path: 'plans', select: 'title' });

        const regions = await Promise.all(
            resultRegions.map(async (region) => {
                // Chờ resolve tất cả các plans
                const plans = await Promise.all(
                    region.plans.map(async (plan) => {
                        const resultProducts = await CloudServerProduct.find({ plan_id: plan._id, status: true })
                            .select('title')
                            .sort({ priority: 1 });

                        const products = resultProducts.map((product) => ({
                            id: product._id,
                            title: product.title,
                        }));

                        return {
                            products,
                            id: plan._id,
                            title: plan.title,
                        };
                    }),
                );

                return {
                    plans,
                    id: region._id,
                    title: region.title,
                };
            }),
        );

        res.status(200).json({
            data: {
                images,
                regions,
            },
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/tryIt.log', 'controlAuthGetCloudServerTryIt', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCloudServerTryIt };
