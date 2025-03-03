import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '~/models/order';
import { Wallet } from '~/models/wallet';
import { configCreateLog } from '~/configs';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';
import { validatorUserDeployCloudServer } from '~/validators/my/cloudServer/deploy';
import { serverAuthCheckUserVPS, serviceAuthCreateVPS } from '~/services/partner/cloudServer';
import { generateVncPassword, randomPasswordCloudServer } from '~/services/my/cloudServer/random';
import { serverUserCalculateExpired, serviceCalculateTotalDiscount } from '~/services/user/calculate';

const controlV2CloudServerDeploy = async (req, res) => {
    try {
        const { display_name } = req.body;

        const validate = await validatorUserDeployCloudServer(req.body);
        if (!validate.success) {
            return res.status(validate.status).json({
                error: validate.error,
            });
        }

        const cloudServerInfo = validate.data;

        const wallet = await Wallet.findOne({ user_id: req.user._id, status: 'activated' }).select('total_balance');
        if (!wallet) {
            return res.status(400).json({ error: 'Ví của bạn không tồn tại hoặc đã bị khoá' });
        }

        const expired_at = serverUserCalculateExpired(
            Date.now(),
            cloudServerInfo.pricing.cycles_id.unit,
            cloudServerInfo.pricing.cycles_id.value,
        );
        if (!expired_at) {
            return res.status(400).json({ error: 'Lỗi tính toán chu kỳ sử dụng' });
        }

        const discountedPrice = cloudServerInfo.pricing.price * display_name.length * (1 - cloudServerInfo.pricing.discount / 100);
        const totalPrice = discountedPrice + cloudServerInfo.pricing.creation_fee;

        const resultPrice = totalPrice * (1 - req.discount / 100);
        if (wallet.total_balance < resultPrice) {
            return res.status(400).json({ error: 'Số dư ví không đủ để thanh toán' });
        }

        const userID = await serverAuthCheckUserVPS(
            cloudServerInfo.partner.url,
            cloudServerInfo.partner.key,
            cloudServerInfo.partner.password,
            req.user,
        );
        if (!userID) {
            return res.status(400).json({ error: 'Tạo người dùng quản lý máy chủ thất bại' });
        }

        let bonusPoint = 0;
        let productOrders = [];
        let productInvoices = [];
        let totalPriceInvoice = 0;
        let orderCloudServerID = [];

        const totalDiscount = serviceCalculateTotalDiscount(cloudServerInfo.pricing.discount, req.discount);

        for (let i = 0; i < display_name.length; i++) {
            const displayName = display_name[i];

            const passwordVNC = generateVncPassword();
            const passwordCloudServer = randomPasswordCloudServer();

            // Dữ liệu tạo VPS
            const postData = {
                vnc: 1,
                addvps: 1,
                virt: 'kvm',
                uid: userID,
                osid: cloudServerInfo.image.code,
                vncpass: passwordVNC,
                plid: cloudServerInfo.product.code,
                rootpass: passwordCloudServer,
                node_select: cloudServerInfo.partner.node_select,
                hostname: displayName.replace(/_/g, '-'),
            };

            const cloudServer = await serviceAuthCreateVPS(
                cloudServerInfo.partner.url,
                cloudServerInfo.partner.key,
                cloudServerInfo.partner.password,
                postData,
            );
            if (!cloudServer.done) {
                return res.status(400).json({ error: 'Khởi tạo máy chủ thất bại' });
            }

            const instance = cloudServer.info;

            const newOrderCloudServer = await new OrderCloudServer({
                user_id: req.user._id,
                plan_id: cloudServerInfo.plan._id,
                region_id: cloudServerInfo.region._id,
                image_id: cloudServerInfo.image._id,
                product_id: cloudServerInfo.product._id,
                pricing_id: cloudServerInfo.pricing._id,
                slug_url: uuidv4(),
                display_name: displayName,
                override_price: resultPrice,
                auto_renew: false,
                backup_server: false,
                bandwidth_usage: 0,
                cpu_usage: 0,
                memory_usage: 0,
                invoice_id: [],
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
                method: 'api',
                description: '',
                expired_at,
            }).save();

            orderCloudServerID.push(newOrderCloudServer._id);

            const orderItem = {
                quantity: 1,
                data_url: null,
                title: 'Đăng ký Cloud Server',
                description: `Đăng ký Cloud Server #${newOrderCloudServer.id} thời gian ${cloudServerInfo.pricing.cycles_id.display_name}`,
                unit_price: cloudServerInfo.pricing.price,
                discount: totalDiscount,
                cycles: cloudServerInfo.pricing.cycles_id.display_name,
                total_price: resultPrice / display_name.length,
                product_id: newOrderCloudServer._id,
                product_type: 'OrderCloudServer',
                pricing_id: cloudServerInfo.pricing._id,
                module: 'register',
                cart_product_id: null,
            };
            productOrders.push(orderItem);

            const invoiceItem = {
                title: 'Đăng ký Cloud Server',
                description: `Đăng ký Cloud Server ${cloudServerInfo.image.title} thời gian ${cloudServerInfo.pricing.cycles_id.display_name}`,
                unit_price: cloudServerInfo.pricing.price,
                quantity: 1,
                fees: cloudServerInfo.pricing.creation_fee,
                cycles: cloudServerInfo.pricing.cycles_id.display_name,
                discount: totalDiscount,
                total_price: resultPrice / display_name.length,
            };
            productInvoices.push(invoiceItem);

            bonusPoint += cloudServerInfo.pricing.bonus_point;
            totalPriceInvoice += cloudServerInfo.pricing.price;
        }

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            req.user._id,
            'service',
            'VND',
            'register',
            productInvoices,
            [],
            bonusPoint,
            -totalPriceInvoice,
            -resultPrice,
            'app_wallet',
            null,
            'Hoá đơn đăng ký Cloud Server',
            true,
        );
        if (!newInvoice.success) {
            return res.status(400).json({
                error: 'Lỗi xử lý hoá đơn thanh toán',
            });
        }

        await OrderCloudServer.updateMany({ _id: { $in: orderCloudServerID } }, { $set: { invoice_id: [newInvoice.data.id] } });

        await new Order({
            user_id: req.user._id,
            invoice_id: newInvoice.data.id,
            products: productOrders,
            coupons: [],
            status: 'completed',
            bonus_point: bonusPoint,
            total_price: totalPriceInvoice,
            total_payment: resultPrice,
            pay_method: 'app_wallet',
            description: '',
        }).save();

        req.service.service_register += display_name.length;
        await req.service.save();

        const responses = await OrderCloudServer.find({ _id: { $in: orderCloudServerID } })
            .populate({ path: 'plan_id', select: 'id title image_url description' })
            .populate({ path: 'region_id', select: 'id title image_url description' })
            .populate({ path: 'image_id', select: 'id title group image_url description' })
            .populate({ path: 'product_id', select: 'id title core memory disk description bandwidth network_speed customize' });

        const data = responses.map((response) => {
            return {
                id: response.id,
                order_info: {
                    port: response.order_info.port,
                    hostname: response.order_info.hostname,
                    username: response.order_info.username,
                    password: response.order_info.password,
                    access_ipv4: response.order_info.access_ipv4,
                    access_ipv6: response.order_info.access_ipv6,
                },
                plan: {
                    id: response.plan_id.id,
                    title: response.plan_id.title,
                    image_url: response.plan_id.image_url,
                    description: response.plan_id.description,
                },
                region: {
                    id: response.region_id.id,
                    title: response.region_id.title,
                    image_url: response.region_id.image_url,
                    description: response.region_id.description,
                },
                image: {
                    id: response.image_id.id,
                    title: response.image_id.title,
                    group: response.image_id.group,
                    image_url: response.image_id.image_url,
                    description: response.image_id.description,
                },
                product: {
                    id: response.product_id.id,
                    ipv4: response.product_id.ipv4,
                    ipv6: response.product_id.ipv6,
                    disk: response.product_id.disk,
                    core: response.product_id.core,
                    title: response.product_id.title,
                    memory: response.product_id.memory,
                    customize: response.product_id.customize,
                    bandwidth: response.product_id.bandwidth,
                    description: response.product_id.description,
                    network_port: response.product_id.network_port,
                    network_speed: response.product_id.network_speed,
                    network_inter: response.product_id.network_inter,
                },
                status: response.status,
                method: response.method,
                slug_url: response.slug_url,
                cpu_usage: response.cpu_usage,
                auto_renew: response.auto_renew,
                disk_usage: response.disk_usage,
                description: response.description,
                memory_usage: response.memory_usage,
                display_name: response.display_name,
                backup_server: response.backup_server,
                override_price: response.override_price,
                bandwidth_usage: response.bandwidth_usage,
                created_at: moment(response.created_at).format('YYYY-MM-DD HH:mm:ss'),
                expired_at: moment(response.expired_at).format('YYYY-MM-DD HH:mm:ss'),
            };
        });

        res.status(200).json({
            data,
            status: 200,
            message: 'Khởi tạo máy chủ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/deploy.log', 'controlV2CloudServerDeploy', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerDeploy };
