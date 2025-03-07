import { Cycles } from '~/models/cycles';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { CloudServerProduct } from '~/models/cloudServerProduct';
import { servicePartnerGetProducts } from '~/services/partner/cloudServer';

const controlAuthAsyncCloudServerProduct = async (req, res) => {
    try {
        const regions = await CloudServerRegion.find({}).select('plans');
        if (regions.length === 0) {
            return res.status(400).json({
                error: 'Vui lòng đồng bộ vui vực chứa máy chủ',
            });
        }

        let allProductIds = [];
        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];

            for (let j = 0; j < region.plans.length; j++) {
                const plan = region.plans[j];

                const result = await servicePartnerGetProducts(plan.id);
                if (result.status !== 200) {
                    return res.status(400).json({
                        error: result.error,
                    });
                }

                for (let l = 0; l < result.data.length; l++) {
                    const product = result.data[l];
                    allProductIds.push(product.id);

                    const isProduct = await CloudServerProduct.findOne({ partner_id: product.id });
                    if (!isProduct) {
                        const newProduct = await new CloudServerProduct({
                            plan_id: plan.id,
                            core: product.core,
                            disk: product.disk,
                            ipv4: product.ipv4,
                            ipv6: product.ipv6,
                            title: product.title,
                            partner_id: product.id,
                            commit: product.commit,
                            memory: product.memory,
                            status: product.status,
                            support: product.support,
                            sold_out: product.sold_out,
                            priority: product.priority,
                            core_info: product.core_info,
                            customize: product.customize,
                            disk_info: product.disk_info,
                            bandwidth: product.bandwidth,
                            memory_info: product.memory_info,
                            description: product.description,
                            network_port: product.network_port,
                            network_speed: product.network_speed,
                            network_inter: product.network_inter,
                        }).save();

                        for (let n = 0; n < product.pricings.length; n++) {
                            const pricing = product.pricings[n];

                            const cycles = await Cycles.findOne({
                                unit: pricing.cycles.unit,
                                value: pricing.cycles.value,
                                display_name: pricing.cycles.display_name,
                            });
                            if (cycles) {
                                const price = Math.round(pricing.price / (1 - pricing.discount / 100));

                                await new Pricing({
                                    partner_id: pricing.id,
                                    service_id: newProduct._id,
                                    service_type: 'CloudServerProduct',
                                    cycles_id: cycles._id,
                                    original_price: pricing.price,
                                    price,
                                    discount: pricing.discount,
                                    creation_fee: 0,
                                    penalty_fee: 0,
                                    renewal_fee: 0,
                                    upgrade_fee: 0,
                                    cancellation_fee: 0,
                                    brokerage_fee: 0,
                                    other_fees: 0,
                                    bonus_point: 0,
                                }).save();
                            }
                        }
                    } else {
                        isProduct.core = product.core;
                        isProduct.disk = product.disk;
                        isProduct.ipv4 = product.ipv4;
                        isProduct.ipv6 = product.ipv6;
                        isProduct.title = product.title;
                        isProduct.updated_at = Date.now();
                        isProduct.memory = product.memory;
                        isProduct.commit = product.commit;
                        isProduct.status = product.status;
                        isProduct.support = product.support;
                        isProduct.priority = product.priority;
                        isProduct.sold_out = product.sold_out;
                        isProduct.core_info = product.core_info;
                        isProduct.disk_info = product.disk_info;
                        isProduct.bandwidth = product.bandwidth;
                        isProduct.customize = product.customize;
                        isProduct.memory_info = product.memory_info;
                        isProduct.description = product.description;
                        isProduct.network_port = product.network_port;
                        isProduct.network_speed = product.network_speed;
                        isProduct.network_inter = product.network_inter;
                        await isProduct.save();

                        for (let n = 0; n < product.pricings.length; n++) {
                            const pricing = product.pricings[n];

                            const cycles = await Cycles.findOne({
                                unit: pricing.cycles.unit,
                                value: pricing.cycles.value,
                                display_name: pricing.cycles.display_name,
                            });
                            if (cycles) {
                                const price = Math.round(pricing.price / (1 - pricing.discount / 100));

                                const currentPricing = await Pricing.findOne({ service_id: isProduct._id, cycles_id: cycles._id });

                                if (currentPricing) {
                                    currentPricing.price = price;
                                    currentPricing.cycles_id = cycles._id;
                                    currentPricing.discount = pricing.discount;
                                    currentPricing.original_price = pricing.price;
                                    await currentPricing.save();
                                }
                            }
                        }
                    }
                }
            }
        }

        // Xoá sản phẩm không có trong mảng trả về
        const existingProducts = await CloudServerProduct.find().select('partner_id');
        const existingProductIds = existingProducts.map((product) => product.partner_id);
        const productsToDelete = existingProductIds.filter((id) => !allProductIds.includes(id));
        await CloudServerProduct.deleteMany({ partner_id: { $in: productsToDelete } });

        res.status(200).json({
            status: 200,
            message: 'Đồng bộ cấu hình với đối tác thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/product/async.log', 'controlAuthAsyncCloudServerProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthAsyncCloudServerProduct };
