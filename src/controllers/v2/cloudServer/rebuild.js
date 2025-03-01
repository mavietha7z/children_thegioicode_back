import moment from 'moment';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { CloudServerImage } from '~/models/cloudServerImage';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerPartner } from '~/models/cloudServerPartner';
import { serviceAuthRebuildVPS } from '~/services/virtualizor/api';

const controlV2CloudServerRebuild = async (req, res) => {
    try {
        const { order_id, image_id } = req.body;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({ error: 'ID đơn hàng máy chủ không hợp lệ' });
        }
        if (!isValidDataId(image_id)) {
            return res.status(400).json({ error: 'ID hệ điều hành không hợp lệ' });
        }

        const order = await OrderCloudServer.findOne({ user_id: req.user._id, id: order_id, status: { $nin: ['deleted', 'expired'] } })
            .populate({ path: 'plan_id', select: '-_id id title image_url description' })
            .populate({ path: 'region_id', select: '-_id id title image_url description' })
            .populate({
                path: 'product_id',
                select: '-_id id title core memory disk bandwidth network_speed customize network_port network_inter ipv4 ipv6',
            });
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng máy chủ không tồn tại' });
        }

        const image = await CloudServerImage.findOne({ id: image_id, status: true }).select('id title code group image_url description');
        if (!image) {
            return res.status(404).json({ error: `Hệ điều hành #${image_id} không tồn tại` });
        }

        const partner = await CloudServerPartner.findOne({}).select('url key password');
        if (!partner) {
            return res.status(404).json({ error: 'Máy chủ đang bảo trì hoặc không hoạt động' });
        }

        const dataPost = {
            reos: 1,
            osid: image.code,
            conf: order.order_info.password,
            vpsid: order.order_info.order_id,
            newpass: order.order_info.password,
        };

        serviceAuthRebuildVPS(partner.url, partner.key, partner.password, dataPost);

        order.status = 'rebuilding';
        order.image_id = image._id;
        order.updated_at = Date.now();
        order.save();

        const data = {
            id: order_id,
            plan: order.plan_id,
            status: order.status,
            method: order.method,
            image: {
                id: image.id,
                title: image.title,
                group: image.group,
                image_url: image.image_url,
                description: image.description,
            },
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
            message: 'Cài lại hệ điều hành máy chủ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/rebuild.log', 'controlV2CloudServerRebuild', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerRebuild };
