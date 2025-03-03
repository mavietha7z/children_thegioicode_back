import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlV2CloudServerGetProducts = async (req, res) => {
    try {
        const { plan_id } = req.params;

        const plan = await CloudServerPlan.findOne({ id: plan_id, status: true }).select('id title');
        if (!plan) {
            return res.status(404).json({ error: 'Loại máy chủ không tồn tại hoặc đã bị tắt' });
        }

        const products = await CloudServerProduct.find({ plan_id: plan._id, status: true })
            .select(
                'id title core core_info memory memory_info disk disk_info bandwidth network_speed network_port network_inter commit support priority customize sold_out status description ipv4 ipv6',
            )
            .sort({ priority: 1 });

        const data = await Promise.all(
            products.map(async (product) => {
                const pricingProducts = await Pricing.find({ service_id: product._id, service_type: 'CloudServerProduct', status: true })
                    .select('id price discount cycles_id creation_fee')
                    .populate({ path: 'cycles_id', select: 'id display_name unit value' });

                const pricings = pricingProducts.map((pricingProduct) => {
                    const discountedPrice = pricingProduct.price * (1 - pricingProduct.discount / 100);
                    const totalPrice = discountedPrice + pricingProduct.creation_fee;

                    const resultPrice = totalPrice * (1 - req.discount / 100);
                    return {
                        id: pricingProduct.id,
                        price: resultPrice,
                        cycles: {
                            unit: pricingProduct.cycles_id.unit,
                            value: pricingProduct.cycles_id.value,
                            display_name: pricingProduct.cycles_id.display_name,
                        },
                    };
                });

                return {
                    pricings,
                    id: product.id,
                    ipv4: product.ipv4,
                    ipv6: product.ipv6,
                    disk: product.disk,
                    core: product.core,
                    title: product.title,
                    memory: product.memory,
                    commit: product.commit,
                    status: product.status,
                    support: product.support,
                    priority: product.priority,
                    sold_out: product.sold_out,
                    disk_info: product.disk_info,
                    customize: product.customize,
                    core_info: product.core_info,
                    bandwidth: product.bandwidth,
                    memory_info: product.memory_info,
                    description: product.description,
                    network_port: product.network_port,
                    network_speed: product.network_speed,
                    network_inter: product.network_inter,
                };
            }),
        );

        res.status(200).json({
            data,
            status: 200,
            message: 'Lấy danh sách gói dịch vụ máy chủ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/product.log', 'controlV2CloudServerGetProducts', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerGetProducts };
