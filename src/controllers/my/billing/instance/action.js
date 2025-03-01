import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerProduct } from '~/models/cloudServerProduct';
import { CloudServerPartner } from '~/models/cloudServerPartner';
import { serviceAuthActionVPSById } from '~/services/virtualizor/api';
import { serviceUserVerifyTokenPartner } from '~/middleware/cloudServer';

const controlUserBillingActionInstance = async (req, res) => {
    try {
        const { action, instance_id } = req.params;

        if (!isValidDataId(instance_id) || !['auto-renew', 'stop', 'start', 'restart', 'resize'].includes(action)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const instance = await OrderCloudServer.findOne({ user_id: req.user.id, id: instance_id, status: { $nin: ['deleted', 'expired'] } })
            .populate({ path: 'plan_id', select: 'id title' })
            .populate({ path: 'region_id', select: 'id title' })
            .populate({ path: 'image_id', select: 'id title group image_url' })
            .populate({ path: 'product_id', select: 'id title core memory disk priority' })
            .populate({
                path: 'pricing_id',
                select: 'id price discount cycles_id',
                populate: { path: 'cycles_id', select: 'id value unit display_name' },
            });
        if (!instance) {
            return res.status(404).json({
                error: `Máy chủ #${instance_id} không tồn tại`,
            });
        }

        let data = null;
        let message = '';
        if (action === 'auto-renew') {
            instance.auto_renew = !instance.auto_renew;

            data = instance.auto_renew;
            message = `Bật/Tắt tự động gia hạn máy chủ thành công`;
        }

        if (action === 'stop' || action === 'start' || action === 'restart') {
            if (instance.status === 'starting') {
                return res.status(400).json({ error: 'Máy chủ đang khởi động không thể hành động' });
            }
            if (instance.status === 'activated' && action === 'start') {
                return res.status(400).json({ error: 'Máy chủ đang hoạt động không thể bật' });
            }
            if (instance.status === 'stopped' && action === 'stop') {
                return res.status(400).json({ error: 'Máy chủ đang dừng hoạt động không thể tắt' });
            }
            if (instance.status === 'stopped' && action === 'restart') {
                return res.status(400).json({ error: 'Máy chủ đang dừng hoạt động không thể khởi động' });
            }

            const partner = await CloudServerPartner.findOne({}).select('url key password');
            if (!partner) {
                return res.status(500).json({ error: 'Máy chủ đang bảo trì hoặc không hoạt động' });
            }

            // Chỉ gửi hành động đi không thêm await
            serviceAuthActionVPSById(partner.url, partner.key, partner.password, action, instance.order_info.order_id);

            if (action === 'stop') {
                instance.status = 'stopping';
            }
            if (action === 'start' || action === 'restart') {
                instance.status = 'restarting';
            }

            message = 'Đã gửi lệnh thực hiện thao tác thành công';
        }

        if (action === 'resize') {
            const partner = await serviceUserVerifyTokenPartner('CloudServer', req.user.id);
            if (!partner.success) {
                return res.status(400).json({ error: partner.error });
            }

            let discount = 0;
            if (partner.data.discount && partner.data.discount > 0) {
                discount = partner.data.discount;
            }

            const products = await CloudServerProduct.find({
                plan_id: instance.plan_id._id,
                status: true,
                _id: { $ne: instance.product_id._id },
                priority: { $gt: instance.product_id.priority },
            })
                .select('id title core memory disk bandwidth network_speed customize sold_out status description')
                .sort({ priority: 1 });

            const result = await Promise.all(
                products.map(async (product) => {
                    const pricingProduct = await Pricing.findOne({
                        service_id: product._id,
                        service_type: 'CloudServerProduct',
                        status: true,
                    })
                        .select('id price discount cycles_id')
                        .populate({ path: 'cycles_id', select: 'id display_name unit value' })
                        .sort({ price: 1 });

                    const pricing = {
                        discount,
                        id: pricingProduct.id,
                        price: pricingProduct.price,
                        cycles: {
                            id: pricingProduct.cycles_id.id,
                            unit: pricingProduct.cycles_id.unit,
                            value: pricingProduct.cycles_id.value,
                            display_name: pricingProduct.cycles_id.display_name,
                        },
                    };

                    return {
                        pricing,
                        id: product.id,
                        disk: product.disk,
                        core: product.core,
                        title: product.title,
                        memory: product.memory,
                        status: product.status,
                        sold_out: product.sold_out,
                        customize: product.customize,
                        bandwidth: product.bandwidth,
                        description: product.description,
                        network_speed: product.network_speed,
                    };
                }),
            );

            const currentPricing = await Pricing.findOne({ service_id: instance.product_id._id })
                .select('id price discount cycles_id')
                .populate({ path: 'cycles_id', select: 'id display_name unit value' })
                .sort({ price: 1 });
            if (!currentPricing) {
                return res.status(400).json({ error: 'Giá gói hiện tại không tồn tại' });
            }

            message = 'Lấy dữ liệu cấu hình có thể nâng cấp thành công';
            data = {
                instance: {
                    pricing: {
                        discount,
                        id: currentPricing.id,
                        price: currentPricing.price,
                        cycles: {
                            id: currentPricing.cycles_id.id,
                            unit: currentPricing.cycles_id.unit,
                            value: currentPricing.cycles_id.value,
                            display_name: currentPricing.cycles_id.display_name,
                        },
                    },
                    id: instance.id,
                    plan: instance.plan_id,
                    status: instance.status,
                    image: instance.image_id,
                    region: instance.region_id,
                    slug_url: instance.slug_url,
                    product: instance.product_id,
                    cpu_usage: instance.cpu_usage,
                    auto_renew: instance.auto_renew,
                    created_at: instance.created_at,
                    expired_at: instance.expired_at,
                    description: instance.description,
                    memory_usage: instance.memory_usage,
                    display_name: instance.display_name,
                    backup_server: instance.backup_server,
                    override_price: instance.override_price,
                    bandwidth_usage: instance.bandwidth_usage,
                    order_info: {
                        port: instance.order_info.port,
                        hostname: instance.order_info.hostname,
                        password: instance.order_info.password,
                        username: instance.order_info.username,
                        access_ipv4: instance.order_info.access_ipv4,
                        access_ipv6: instance.order_info.access_ipv6,
                    },
                },
                products: result,
            };
        }

        instance.updated_at = Date.now();
        await instance.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/instance/action.log', 'controlUserBillingActionInstance', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserBillingActionInstance };
