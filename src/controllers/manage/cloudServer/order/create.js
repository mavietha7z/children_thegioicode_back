import { v4 as uuidv4 } from 'uuid';
import { User } from '~/models/user';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { CloudServerPlan } from '~/models/cloudServerPlan';
import { CloudServerImage } from '~/models/cloudServerImage';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerRegion } from '~/models/cloudServerRegion';
import { CloudServerPartner } from '~/models/cloudServerPartner';
import { CloudServerProduct } from '~/models/cloudServerProduct';
import { serviceUserCalculateExpiredTryIt } from '~/services/user/calculate';
import { serverAuthCheckUserVPS, serviceAuthCreateVPS } from '~/services/virtualizor/api';
import { generateVncPassword, randomPasswordCloudServer } from '~/services/my/cloudServer/random';

const controlAuthCreateCloudServerOrder = async (req, res) => {
    try {
        const { user_id, plan_id, image_id, region_id, product_id, expired_at: expiredAt } = req.body;

        if (!isValidMongoId(user_id)) {
            return res.status(400).json({ error: 'ID người dùng không hợp lệ' });
        }
        if (!isValidMongoId(plan_id)) {
            return res.status(400).json({ error: 'ID loại máy chủ không hợp lệ' });
        }
        if (!isValidMongoId(image_id)) {
            return res.status(400).json({ error: 'ID hệ điều hành không hợp lệ' });
        }
        if (!isValidMongoId(region_id)) {
            return res.status(400).json({ error: 'ID khu vực máy chủ không hợp lệ' });
        }
        if (!isValidMongoId(product_id)) {
            return res.status(400).json({ error: 'ID cấu hình máy chủ không lệ' });
        }
        if (!expiredAt) {
            return res.status(400).json({ error: 'Thời hạn dùng thử không hợp lệ' });
        }

        const user = await User.findById(user_id).select('id email full_name username');
        if (!user) {
            return res.status(404).json({ error: 'Người dùng tạo đơn không tồn tại' });
        }

        const checkTryIt = await OrderCloudServer.findOne({ user_id: user._id, try_it: true });
        if (checkTryIt) {
            return res.status(400).json({ error: 'Người dùng này đã được dùng thử máy chủ' });
        }

        const plan = await CloudServerPlan.findById(plan_id).select('id title');
        if (!plan) {
            return res.status(404).json({ error: 'Loại máy chủ không tồn tại' });
        }

        const region = await CloudServerRegion.findById(region_id).select('id title');
        if (!region) {
            return res.status(404).json({ error: 'Khu vực máy chủ không tồn tại' });
        }

        const image = await CloudServerImage.findById(image_id).select('id title code image_url');
        if (!image) {
            return res.status(404).json({ error: 'Hình ảnh máy chủ không tồn tại' });
        }

        const product = await CloudServerProduct.findById(product_id).select('id title code core memory disk');
        if (!product) {
            return res.status(404).json({ error: 'Gói dịch vụ máy chủ không tồn tại' });
        }

        const partner = await CloudServerPartner.findOne({}).select('url key password node_select');
        if (!partner) {
            return res.status(404).json({ error: 'Đối tác đang bảo trì' });
        }

        const pricing = await Pricing.findOne({ service_id: product._id })
            .select('id price discount cycles_id')
            .populate({ path: 'cycles_id', select: 'id display_name unit value' })
            .sort({ price: 1 });
        if (!pricing) {
            return res.status(404).json({
                error: `Giá gói máy chủ #${instance_id} không tồn tại`,
            });
        }

        const userID = await serverAuthCheckUserVPS(partner.url, partner.key, partner.password, user);
        if (!userID) {
            return res.status(400).json({ error: 'Tạo người dùng quản lý máy chủ thất bại' });
        }

        const passwordVNC = generateVncPassword();
        const passwordCloudServer = randomPasswordCloudServer();
        const display_name = `instance_${Math.floor(Math.random() * 99999999) + 1}`;

        const expired_at = serviceUserCalculateExpiredTryIt(expiredAt);
        if (!expired_at) {
            return res.status(400).json({ error: 'Lỗi tính toán thời gian dùng thử' });
        }

        // Dữ liệu tạo VPS
        const postData = {
            vnc: 1,
            addvps: 1,
            virt: 'kvm',
            uid: userID,
            osid: image.code,
            vncpass: passwordVNC,
            plid: product.code,
            rootpass: passwordCloudServer,
            node_select: partner.node_select,
            hostname: display_name.replace(/_/g, '-'),
        };

        const cloudServer = await serviceAuthCreateVPS(partner.url, partner.key, partner.password, postData);
        if (!cloudServer.done) {
            return res.status(400).json({ error: 'Khởi tạo máy chủ dùng thử thất bại' });
        }

        const newOrderCloudServer = await new OrderCloudServer({
            user_id: user._id,
            plan_id: plan._id,
            region_id: region._id,
            image_id: image._id,
            product_id: product._id,
            pricing_id: pricing._id,
            slug_url: uuidv4(),
            display_name,
            override_price: 0,
            auto_renew: false,
            backup_server: false,
            bandwidth_usage: 0,
            cpu_usage: 0,
            memory_usage: 0,
            invoice_id: [],
            order_info: {
                uuid: cloudServer.info.uuid,
                order_id: cloudServer.info.vpsid,
                access_ipv4: cloudServer.info.ips[0],
                access_ipv6: '',
                hostname: cloudServer.info.hostname,
                username: 'root',
                password: passwordCloudServer,
                port: 22,
                password_vnc: passwordVNC,
            },
            status: 'starting',
            try_it: true,
            method: 'register',
            description: '',
            expired_at,
        }).save();

        const data = {
            user,
            plan,
            image,
            region,
            product,
            pricing,
            cpu_usage: 0,
            expired_at,
            display_name,
            disk_usage: 0,
            description: '',
            memory_usage: 0,
            override_price: 0,
            auto_renew: false,
            method: 'register',
            status: 'starting',
            bandwidth_usage: 0,
            backup_server: false,
            created_at: Date.now(),
            updated_at: Date.now(),
            id: newOrderCloudServer.id,
            key: newOrderCloudServer._id,
            slug_url: newOrderCloudServer.slug_url,
            invoice_id: newOrderCloudServer.invoice_id,
            order_info: newOrderCloudServer.order_info,
        };

        return res.status(200).json({
            data,
            status: 200,
            message: `Thêm đơn máy chủ dùng thử #${newOrderCloudServer.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/order/create.log', 'controlAuthCreateCloudServerOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateCloudServerOrder };
