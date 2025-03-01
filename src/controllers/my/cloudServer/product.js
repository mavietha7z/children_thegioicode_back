import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { CloudServerPlan } from '~/models/cloudServerPlan';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const calculateCyclesPayments = (products) => {
    const cycleMap = new Map();

    // Duyệt qua từng gói dịch vụ
    products.forEach((service) => {
        service.pricings.forEach((pricing) => {
            const cycle = pricing.cycles;
            const discount = pricing.discount;

            // Nếu chu kỳ đã tồn tại, cập nhật tổng chiết khấu và số lượng
            if (cycleMap.has(cycle.id)) {
                const existing = cycleMap.get(cycle.id);
                cycleMap.set(cycle.id, {
                    ...existing,
                    totalDiscount: existing.totalDiscount + discount,
                    count: existing.count + 1,
                });
            } else {
                // Nếu chu kỳ chưa tồn tại, thêm vào map
                cycleMap.set(cycle.id, {
                    count: 1,
                    id: cycle.id,
                    unit: cycle.unit,
                    value: cycle.value,
                    totalDiscount: discount,
                    title: cycle.display_name,
                });
            }
        });
    });

    // Chuyển đổi Map sang mảng và tính chiết khấu trung bình
    return Array.from(cycleMap.values()).map((cycle) => ({
        title: cycle.title,
        discount: cycle.totalDiscount > 0 ? `-${cycle.totalDiscount / cycle.count}%` : '',
    }));
};

const controlUserGetCloudServerProducts = async (req, res) => {
    try {
        const { plan_id } = req.params;

        let partnerDiscount = 0;
        if (req.discount && req.discount > 0) {
            partnerDiscount = req.discount;
        }

        const plan = await CloudServerPlan.findOne({ id: plan_id, status: true }).select('id title');
        if (!plan) {
            return res.status(404).json({ error: 'Máy chủ cần truy vấn không tồn tại hoặc đã bị tắt' });
        }

        const products = await CloudServerProduct.find({ plan_id: plan._id, status: true })
            .select(
                'id title core memory disk bandwidth network_speed network_port network_inter customize sold_out ipv4 ipv6 status description',
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

                    const resultPrice = totalPrice * (1 - partnerDiscount / 100);

                    return {
                        id: pricingProduct.id,
                        price: resultPrice,
                        discount: pricingProduct.discount,
                        cycles: {
                            id: pricingProduct.cycles_id.id,
                            unit: pricingProduct.cycles_id.unit,
                            value: pricingProduct.cycles_id.value,
                            display_name: pricingProduct.cycles_id.display_name,
                        },
                    };
                });

                return {
                    pricings,
                    id: product.id,
                    disk: product.disk,
                    ipv4: product.ipv4,
                    ipv6: product.ipv6,
                    core: product.core,
                    title: product.title,
                    memory: product.memory,
                    status: product.status,
                    sold_out: product.sold_out,
                    customize: product.customize,
                    bandwidth: product.bandwidth,
                    description: product.description,
                    network_port: product.network_port,
                    network_speed: product.network_speed,
                    network_inter: product.network_inter,
                };
            }),
        );

        const cycles = calculateCyclesPayments(data);

        res.status(200).json({
            data,
            cycles,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/cloudServer/product.log', 'controlUserGetCloudServerProducts', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetCloudServerProducts };
