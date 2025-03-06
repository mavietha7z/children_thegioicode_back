import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { CloudServerProduct } from '~/models/cloudServerProduct';
import { serviceUserCalculateExpiredTryIt } from '~/services/user/calculate';
import { servicePartnerGetOrders } from '~/services/partner/cloudServer';

const controlAuthAsyncCloudServerOrder = async (req, res) => {
    try {
        let result;
        let page = 1;
        let orders = [];

        // Lặp đến khi không còn trang tiếp theo
        do {
            result = await servicePartnerGetOrders(page);

            if (result.status !== 200) {
                return res.status(400).json({
                    error: result.error,
                });
            }

            // Gộp dữ liệu vào mảng orders
            orders = orders.concat(result.data);

            page++;
        } while (page <= result.pages);

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const isOrder = await OrderCloudServer.findOne({ 'order_info.order_id': order.id });

            if (!isOrder) {
                const region = await CloudServerRegion.findOne({ partner_id: order.region.id });
                if (!region) {
                    continue;
                }

                const plan = region.plans.find((pl) => pl.id === order.plan.id);
                if (!plan) {
                    continue;
                }

                const image = await CloudServerImage.findOne({ partner_id: order.image.id });
                if (!image) {
                    continue;
                }

                const product = await CloudServerProduct.findOne({ partner_id: order.product.id });
                if (!product) {
                    continue;
                }

                const pricing = await Pricing.findOne({ service_id: product._id, service_type: 'CloudServerProduct' }).sort({ price: 1 });
                if (!pricing) {
                    continue;
                }

                await new OrderCloudServer({
                    user_id: req.user.id,
                    region_id: region._id,
                    image_id: image._id,
                    product_id: product._id,
                    pricing_id: pricing._id,
                    plan: {
                        id: plan.id,
                        title: plan.title,
                        image_url: plan.image_url,
                        description: plan.description,
                    },
                    slug_url: order.slug_url,
                    display_name: order.display_name,
                    override_price: 0,
                    auto_renew: order.auto_renew,
                    backup_server: order.backup_server,
                    bandwidth_usage: order.backup_server,
                    disk_usage: order.disk_usage,
                    cpu_usage: order.cpu_usage,
                    memory_usage: order.memory_usage,
                    order_info: {
                        order_id: order.id,
                        access_ipv4: order.order_info.access_ipv4,
                        access_ipv6: order.order_info.access_ipv6,
                        hostname: order.order_info.hostname,
                        username: order.order_info.username,
                        password: order.order_info.password,
                        port: order.order_info.port,
                    },
                    status: order.status,
                    method: order.method,
                    description: order.description,
                    created_at: new Date(order.created_at),
                    expired_at: new Date(order.expired_at),
                }).save();
            }
        }

        res.status(200).json({
            status: 200,
            message: 'Đồng bộ đơn máy chủ với đối tác thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/order/async.log', 'controlAuthAsyncCloudServerOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthAsyncCloudServerOrder };
