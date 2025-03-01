import moment from 'moment';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerPartner } from '~/models/cloudServerPartner';
import { serviceAuthActionVPSById } from '~/services/virtualizor/api';

const controlV2CloudServerAction = async (req, res) => {
    try {
        const { order_id, action } = req.body;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({ error: 'ID đơn hàng máy chủ không hợp lệ' });
        }

        if (!['auto-renew', 'stop', 'start', 'restart'].includes(action)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const order = await OrderCloudServer.findOne({ user_id: req.user._id, id: order_id, status: { $nin: ['deleted', 'expired'] } })
            .populate({ path: 'plan_id', select: '-_id id title image_url description' })
            .populate({ path: 'region_id', select: '-_id id title image_url description' })
            .populate({ path: 'image_id', select: '-_id id title group image_url description' })
            .populate({
                path: 'product_id',
                select: '-_id id title core memory disk bandwidth network_speed customize network_port network_inter ipv4 ipv6',
            });
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng máy chủ không tồn tại' });
        }

        let message = '';
        if (action === 'auto-renew') {
            order.auto_renew = !order.auto_renew;

            message = order.auto_renew ? 'Bật' : 'Tắt';
            message += 'tự động gia hạn máy chủ thành công';
        }

        if (action === 'stop' || action === 'start' || action === 'restart') {
            if (order.status === 'starting') {
                return res.status(400).json({ error: 'Máy chủ đang khởi động không thể thao tác' });
            }
            if (order.status === 'activated' && action === 'start') {
                return res.status(400).json({ error: 'Máy chủ đang hoạt động không thể bật' });
            }
            if (order.status === 'stopped' && action === 'stop') {
                return res.status(400).json({ error: 'Máy chủ đang dừng hoạt động không thể tắt' });
            }
            if (order.status === 'stopped' && action === 'restart') {
                return res.status(400).json({ error: 'Máy chủ đang dừng hoạt động không thể khởi động' });
            }

            const partner = await CloudServerPartner.findOne({}).select('url key password');
            if (!partner) {
                return res.status(500).json({ error: 'Máy chủ đang bảo trì hoặc không hoạt động' });
            }

            // Chỉ gửi thao tác đi không thêm await
            serviceAuthActionVPSById(partner.url, partner.key, partner.password, action, order.order_info.order_id);

            if (action === 'stop') {
                order.status = 'stopping';
            }
            if (action === 'start' || action === 'restart') {
                order.status = 'restarting';
            }

            message = `Thực hiện thao tác ${action} máy chủ thành công`;
        }

        order.updated_at = Date.now();
        order.save();

        const data = {
            id: order_id,
            plan: order.plan_id,
            status: order.status,
            method: order.method,
            image: order.image_id,
            region: order.region_id,
            slug_url: order.slug_url,
            product: order.product_id,
            cpu_usage: order.cpu_usage,
            auto_renew: order.auto_renew,
            disk_usage: order.disk_usage,
            description: order.description,
            memory_usage: order.memory_usage,
            display_name: order.display_name,
            backup_server: order.backup_server,
            override_price: order.override_price,
            bandwidth_usage: order.bandwidth_usage,
            order_info: {
                port: order.order_info.port,
                hostname: order.order_info.hostname,
                username: order.order_info.username,
                password: order.order_info.password,
                access_ipv4: order.order_info.access_ipv4,
                access_ipv6: order.order_info.access_ipv6,
            },
            created_at: moment(order.created_at).format('YYYY-MM-DD HH:mm:ss'),
            expired_at: moment(order.expired_at).format('YYYY-MM-DD HH:mm:ss'),
        };

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/action.log', 'controlV2CloudServerAction', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerAction };
