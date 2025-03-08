import { v4 as uuidv4 } from 'uuid';
import { configCreateLog } from '~/configs';
import { CartProduct } from '~/models/cartProduct';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { servicePartnerDeploy } from '~/services/partner/cloudServer';
import { serviceCreateNotification } from '~/services/user/notification';

const serviceUserPaymentOrderRegisterCloudServer = async (order_id, invoice) => {
    try {
        const cartProduct = await CartProduct.findById(order_id)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'product_id', select: 'id partner_id' })
            .populate({
                path: 'pricing_id',
                select: 'id partner_id',
                populate: { path: 'cycles_id', select: 'id value unit display_name' },
            })
            .populate({ path: 'region_id', select: 'id partner_id' })
            .populate({ path: 'image_id', select: 'id partner_id' });

        if (!cartProduct) {
            return { success: false, status: 400, error: 'Đơn máy chủ cần thanh toán không tồn tại' };
        }

        const postData = {
            plan_id: cartProduct.plan.id,
            display_name: [cartProduct.display_name],
            image_id: cartProduct.image_id.partner_id,
            region_id: cartProduct.region_id.partner_id,
            pricing_id: cartProduct.pricing_id.partner_id,
            product_id: cartProduct.product_id.partner_id,
        };

        const result = await servicePartnerDeploy(postData);
        if (result.status !== 200) {
            return { success: false, status: 400, error: result.error };
        }

        const instance = result.data[0];
        if (!instance) {
            return { success: false, status: 400, error: 'Lỗi khởi tạo máy chủ với đối tác' };
        }

        const newOrderCloudServer = await new OrderCloudServer({
            user_id: cartProduct.user_id._id,
            region_id: cartProduct.region_id._id,
            image_id: cartProduct.image_id._id,
            product_id: cartProduct.product_id._id,
            pricing_id: cartProduct.pricing_id._id,
            plan: {
                id: cartProduct.plan.id,
                title: cartProduct.plan.title,
                image_url: cartProduct.plan.image_url,
                description: cartProduct.plan.description,
            },
            slug_url: uuidv4(),
            display_name: cartProduct.display_name,
            override_price: Math.abs(invoice.total_payment),
            auto_renew: false,
            backup_server: false,
            bandwidth_usage: 0,
            disk_usage: 0,
            cpu_usage: 0,
            memory_usage: 0,
            invoice_id: [invoice.id],
            order_info: {
                order_id: instance.id,
                access_ipv4: instance.order_info.access_ipv4,
                access_ipv6: instance.order_info.access_ipv6,
                hostname: instance.order_info.hostname,
                username: instance.order_info.username,
                password: instance.order_info.password,
                port: instance.order_info.port,
            },
            status: instance.status,
            method: 'register',
            description: '',
            expired_at: new Date(instance.expired_at),
        }).save();

        // Thông báo email
        await serviceCreateNotification(
            cartProduct.user_id._id,
            'Email',
            'Thông tin máy chủ Cloud Server',
            `Hệ thống đã khởi tạo thành công dịch vụ Cloud Server với các thông tin như sau: <br /><br /> IPv4: ${instance.order_info.access_ipv4} <br /> Username: root <br /> Password: ${instance.order_info.password} <br /> Port: 22 <br /><br /> Xem thêm thông tin tại: https://netcode.vn/billing/instances/${newOrderCloudServer.id}`,
            'Hoá đơn thanh toán đã xuất không thể hoàn tác.',
        );

        return { success: true, status: 200 };
    } catch (error) {
        configCreateLog('services/my/order/payment/cloudServer.log', 'serviceUserPaymentOrderRegisterCloudServer', error.message);
        return { success: false, status: 400, error: 'Lỗi đăng ký máy chủ' };
    }
};

export { serviceUserPaymentOrderRegisterCloudServer };
