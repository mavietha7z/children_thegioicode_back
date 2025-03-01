import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';
const controlUserBillingGetInstances = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await OrderCloudServer.countDocuments({ user_id: req.user.id });
        const pages = Math.ceil(count / pageSize);

        const results = await OrderCloudServer.find({ user_id: req.user.id })
            .populate({ path: 'plan_id', select: 'id title' })
            .populate({ path: 'region_id', select: 'id title image_url' })
            .populate({ path: 'image_id', select: 'id title group image_url' })
            .populate({ path: 'product_id', select: 'id title core memory disk' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const startIndex = (req.page - 1) * pageSize + 1;

        const data = results.map((result, index) => {
            return {
                id: result.id,
                plan: {
                    id: result.plan_id.id,
                    title: result.plan_id.title,
                },
                image: {
                    id: result.image_id.id,
                    title: result.image_id.title,
                    group: result.image_id.group,
                    image_url: result.image_id.image_url,
                },
                region: {
                    id: result.region_id.id,
                    title: result.region_id.title,
                    image_url: result.region_id.image_url,
                },
                product: {
                    id: result.product_id.id,
                    core: result.product_id.core,
                    disk: result.product_id.disk,
                    title: result.product_id.title,
                    memory: result.product_id.memory,
                },
                order_info: {
                    port: result.order_info.port,
                    hostname: result.order_info.hostname,
                    password: result.order_info.password,
                    username: result.order_info.username,
                    access_ipv4: result.order_info.access_ipv4,
                    access_ipv6: result.order_info.access_ipv6,
                },
                status: result.status,
                try_it: result.try_it,
                index: startIndex + index,
                slug_url: result.slug_url,
                auto_renew: result.auto_renew,
                created_at: result.created_at,
                expired_at: result.expired_at,
                display_name: result.display_name,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/instance/get.log', 'controlUserBillingGetInstances', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserBillingGetInstanceDetail = async (req, res) => {
    try {
        const { instance_id } = req.params;

        if (!isValidDataId(instance_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const instance = await OrderCloudServer.findOne({ user_id: req.user.id, id: instance_id })
            .populate({ path: 'plan_id', select: '-_id id title' })
            .populate({ path: 'region_id', select: '-_id id title' })
            .populate({ path: 'image_id', select: '-_id id title group image_url' })
            .populate({ path: 'product_id', select: '-_id id title core memory disk bandwidth' });
        if (!instance) {
            return res.status(404).json({
                error: `Máy chủ #${instance_id} không tồn tại`,
            });
        }

        let data = {
            id: instance.id,
            image: instance.image_id,
            plan: instance.plan_id,
            status: instance.status,
            region: instance.region_id,
            product: instance.product_id,
            slug_url: instance.slug_url,
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
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/instance/get.log', 'controlUserBillingGetInstanceDetail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserBillingGetInstances, controlUserBillingGetInstanceDetail };
