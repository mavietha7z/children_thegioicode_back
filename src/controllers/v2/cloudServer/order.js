import moment from 'moment';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';

const controlV2CloudServerGetOrders = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await OrderCloudServer.countDocuments({ user_id: req.user._id });
        const pages = Math.ceil(count / pageSize);

        const orders = await OrderCloudServer.find({ user_id: req.user._id })
            .populate({ path: 'plan_id', select: '-_id id title image_url description' })
            .populate({ path: 'region_id', select: '-_id id title image_url description' })
            .populate({ path: 'image_id', select: '-_id id title group image_url description' })
            .populate({
                path: 'product_id',
                select: '-_id id title core memory disk bandwidth network_speed customize network_port network_inter ipv4 ipv6',
            })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = orders.map((order) => {
            const {
                id,
                status,
                method,
                slug_url,
                auto_renew,
                cpu_usage,
                order_info,
                expired_at,
                created_at,
                disk_usage,
                description,
                display_name,
                memory_usage,
                plan_id: plan,
                backup_server,
                override_price,
                image_id: image,
                bandwidth_usage,
                region_id: region,
                product_id: product,
            } = order;

            return {
                id,
                plan,
                image,
                status,
                region,
                method,
                product,
                slug_url,
                cpu_usage,
                auto_renew,
                disk_usage,
                description,
                memory_usage,
                display_name,
                backup_server,
                override_price,
                bandwidth_usage,
                order_info: {
                    port: order_info.port,
                    hostname: order_info.hostname,
                    username: order_info.username,
                    password: order_info.password,
                    access_ipv4: order_info.access_ipv4,
                    access_ipv6: order_info.access_ipv6,
                },
                created_at: moment(created_at).format('YYYY-MM-DD HH:mm:ss'),
                expired_at: moment(expired_at).format('YYYY-MM-DD HH:mm:ss'),
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
            message: 'Lấy danh sách máy chủ đã tạo thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/order.log', 'controlV2CloudServerGetOrders', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlV2CloudServerGetOrderByID = async (req, res) => {
    try {
        const { order_id } = req.params;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({ error: 'ID đơn máy chủ hàng không hợp lệ' });
        }

        const order = await OrderCloudServer.findOne({ user_id: req.user._id, id: order_id })
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

        const data = {
            id: order.id,
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
            status: 200,
            message: 'Lấy chi tiết máy chủ đã tạo thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/order.log', 'controlV2CloudServerGetOrderByID', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerGetOrders, controlV2CloudServerGetOrderByID };
