import { v4 as uuidv4 } from 'uuid';
import { CartProduct } from '~/models/cartProduct';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { serverUserCalculateExpired } from '~/services/user/calculate';
import { serviceCreateNotificationUser } from '~/services/user/notification';
import { sendMessageBotTelegramApp, sendMessageBotTelegramError } from '~/bot';
import { serverAuthCheckUserVPS, serviceAuthCreateVPS } from '~/services/virtualizor/api';
import { generateVncPassword, randomPasswordCloudServer } from '../../cloudServer/random';

const serviceUserPaymentOrderRegisterCloudServer = async (order_id, invoice) => {
    try {
        const cartProduct = await CartProduct.findById(order_id)
            .populate({ path: 'user_id', select: 'id email full_name username' })
            .populate({ path: 'product_id', select: 'id title code core memory disk bandwidth network_speed customize sold_out' })
            .populate({
                path: 'pricing_id',
                select: 'id cycles_id original_price price discount creation_fee penalty_fee renewal_fee upgrade_fee cancellation_fee other_fees bonus_point',
                populate: { path: 'cycles_id', select: 'id value unit display_name' },
            })
            .populate({ path: 'partner_id', select: 'id url node_select key password' })
            .populate({ path: 'plan_id', select: 'id title image_url' })
            .populate({ path: 'region_id', select: 'id title image_url' })
            .populate({ path: 'image_id', select: 'id title group code image_url' })
            .populate({ path: 'image_id', select: 'id title group code image_url' });

        const expired_at = serverUserCalculateExpired(
            Date.now(),
            cartProduct.pricing_id.cycles_id.unit,
            cartProduct.pricing_id.cycles_id.value,
        );
        if (!expired_at) {
            return { success: false, status: 400, error: 'Lỗi tính toán chu kỳ sử dụng' };
        }

        const userID = await serverAuthCheckUserVPS(
            cartProduct.partner_id.url,
            cartProduct.partner_id.key,
            cartProduct.partner_id.password,
            cartProduct.user_id,
        );
        if (!userID) {
            return { success: false, status: 400, error: 'Tạo người dùng quản lý máy chủ thất bại' };
        }

        const passwordVNC = generateVncPassword();
        const passwordCloudServer = randomPasswordCloudServer();

        // Dữ liệu tạo VPS
        const postData = {
            vnc: 1,
            addvps: 1,
            virt: 'kvm',
            uid: userID,
            osid: cartProduct.image_id.code,
            vncpass: passwordVNC,
            plid: cartProduct.product_id.code,
            rootpass: passwordCloudServer,
            node_select: cartProduct.partner_id.node_select,
            hostname: cartProduct.display_name.replace(/_/g, '-'),
        };

        const cloudServer = await serviceAuthCreateVPS(
            cartProduct.partner_id.url,
            cartProduct.partner_id.key,
            cartProduct.partner_id.password,
            postData,
        );
        if (!cloudServer.done) {
            return { success: false, status: 400, error: 'Khởi tạo máy chủ thất bại' };
        }

        const instance = cloudServer.info;

        const newOrderCloudServer = await new OrderCloudServer({
            user_id: cartProduct.user_id._id,
            plan_id: cartProduct.plan_id._id,
            region_id: cartProduct.region_id._id,
            image_id: cartProduct.image_id._id,
            product_id: cartProduct.product_id._id,
            pricing_id: cartProduct.pricing_id._id,
            slug_url: uuidv4(),
            display_name: cartProduct.display_name,
            override_price: Math.abs(invoice.total_payment),
            auto_renew: false,
            backup_server: false,
            bandwidth_usage: 0,
            cpu_usage: 0,
            memory_usage: 0,
            invoice_id: [invoice.id],
            order_info: {
                uuid: instance.uuid,
                order_id: instance.vpsid,
                access_ipv4: instance.ips[0],
                access_ipv6: '',
                hostname: instance.hostname,
                username: 'root',
                password: passwordCloudServer,
                port: 22,
                password_vnc: passwordVNC,
            },
            status: 'starting',
            try_it: false,
            method: 'register',
            description: '',
            expired_at,
        }).save();

        // Thông báo email
        await serviceCreateNotificationUser(
            cartProduct.user_id._id,
            'Email',
            'Thông tin máy chủ Cloud Server',
            `Hệ thống đã khởi tạo thành công dịch vụ Cloud Server với các thông tin như sau: <br /><br /> IPv4: ${instance.ips[0]} <br /> Username: root <br /> Password: ${passwordCloudServer} <br /> Port: 22 <br /><br /> Xem thêm thông tin tại: https://thegioicode.com/billing/instances/${newOrderCloudServer.id}`,
            'Hoá đơn thanh toán đã xuất không thể hoàn tác.',
        );

        // Bot telegram
        sendMessageBotTelegramApp(
            `Khác hàng: \n ${cartProduct.user_id.email} \n ${cartProduct.user_id.full_name} \n\n Khởi tạo Cloud Server với mã đơn #${newOrderCloudServer.id}`,
        );

        return { success: true, status: 200 };
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi đăng ký Cloud Server: \n\n ${error.message}`);
        configCreateLog('services/my/order/payment/cloudServer.log', 'serviceUserPaymentOrderRegisterCloudServer', error.message);
        return { success: false, status: 400, error: 'Lỗi đăng ký máy chủ' };
    }
};

export { serviceUserPaymentOrderRegisterCloudServer };
