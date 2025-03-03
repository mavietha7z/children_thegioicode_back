import moment from 'moment';
import { Order } from '~/models/order';
import { Wallet } from '~/models/wallet';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerProduct } from '~/models/cloudServerProduct';
import { CloudServerPartner } from '~/models/partner';
import { serviceAuthManageVPS } from '~/services/partner/cloudServer';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';
import {
    serviceCalculateUpgradeCost,
    serviceGetDaysInCurrentMonth,
    serviceCalculateRemainingDays,
    serviceCalculateRemainingRatio,
} from '~/services/user/calculate';

const controlV2CloudServerGetResizeInfo = async (req, res) => {
    try {
        const { order_id } = req.params;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({ error: 'ID đơn hàng máy chủ không hợp lệ' });
        }

        const order = await OrderCloudServer.findOne({ user_id: req.user._id, id: order_id, status: { $nin: ['deleted', 'expired'] } })
            .populate({
                path: 'product_id',
                select: 'id title priority',
            })
            .populate({
                path: 'pricing_id',
                select: 'id price discount cycles_id',
                populate: { path: 'cycles_id', select: 'id value unit display_name' },
            });
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng máy chủ không tồn tại' });
        }

        const products = await CloudServerProduct.find({
            plan_id: order.plan_id,
            status: true,
            _id: { $ne: order.product_id._id },
            priority: { $gt: order.product_id.priority },
        })
            .select(
                'id title core memory disk bandwidth network_speed priority customize sold_out status description network_port network_inter ipv4 ipv6',
            )
            .sort({ priority: 1 });

        const data = await Promise.all(
            products.map(async (product) => {
                const currentPricing = await Pricing.findOne({ service_id: order.product_id._id })
                    .select('id price discount cycles_id')
                    .populate({ path: 'cycles_id', select: 'id display_name unit value' })
                    .sort({ price: 1 });
                if (!currentPricing) {
                    return res.status(400).json({ error: 'Giá gói hiện tại không tồn tại' });
                }

                const newPricing = await Pricing.findOne({
                    service_id: product._id,
                    service_type: 'CloudServerProduct',
                    status: true,
                })
                    .select('id price discount cycles_id')
                    .populate({ path: 'cycles_id', select: 'id display_name unit value' })
                    .sort({ price: 1 });

                if (!newPricing) {
                    return res.status(400).json({ error: 'Giá gói nâng cấp không tồn tại' });
                }

                // Số ngày còn lại
                const remainingDays = serviceCalculateRemainingDays(order.expired_at);

                // Số ngày trong tháng
                const daysInMonth = serviceGetDaysInCurrentMonth();

                // Số tiền cần trả nếu nâng cấp gói
                const totalPriceUpgrade = serviceCalculateUpgradeCost(currentPricing.price, newPricing.price, remainingDays, daysInMonth);

                // Giảm theo chiết khấu cho đối tác
                const priceAfterDiscount = totalPriceUpgrade * (1 - req.discount / 100);

                // Thời gian sử dụng cho gói nâng cấp (Tháng)
                const remainingRatio = serviceCalculateRemainingRatio(remainingDays, daysInMonth);

                const pricing = {
                    price: Math.round(priceAfterDiscount),
                    cycle: `${remainingRatio} Tháng`,
                };

                return {
                    pricing,
                    id: product.id,
                    ipv4: product.ipv4,
                    ipv6: product.ipv6,
                    disk: product.disk,
                    core: product.core,
                    title: product.title,
                    memory: product.memory,
                    status: product.status,
                    priority: product.priority,
                    sold_out: product.sold_out,
                    customize: product.customize,
                    bandwidth: product.bandwidth,
                    description: product.description,
                    network_port: product.network_port,
                    network_speed: product.network_speed,
                    network_inter: product.network_inter,
                };
            }),
        );

        res.status(200).json({
            data,
            status: 200,
            message: 'Lấy thông tin nâng cấp cấu hình thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/resize.log', 'controlV2CloudServerGetResizeInfo', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlV2CloudServerResizeOrder = async (req, res) => {
    try {
        const { order_id, product_id } = req.body;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({ error: 'ID đơn hàng máy chủ không hợp lệ' });
        }
        if (!isValidDataId(product_id)) {
            return res.status(400).json({ error: 'ID gói dịch vụ không hợp lệ' });
        }

        const order = await OrderCloudServer.findOne({ user_id: req.user._id, id: order_id, status: { $nin: ['deleted', 'expired'] } })
            .populate({ path: 'plan_id', select: 'id title image_url description' })
            .populate({ path: 'region_id', select: '-_id id title image_url description' })
            .populate({ path: 'image_id', select: '-_id id title group image_url description' })
            .populate({ path: 'product_id', select: 'id title core memory disk priority bandwidth network_speed customize' })
            .populate({
                path: 'pricing_id',
                select: 'id price discount cycles_id',
                populate: { path: 'cycles_id', select: 'id value unit display_name' },
            });
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng máy chủ không tồn tại' });
        }

        const newProduct = await CloudServerProduct.findOne({ plan_id: order.plan_id._id, id: product_id, status: true });
        if (!newProduct) {
            return res.status(404).json({
                error: `Gói máy chủ #${product_id} không tồn tại`,
            });
        }

        if (
            newProduct.core < order.product_id.core ||
            newProduct.memory < order.product_id.memory ||
            newProduct.disk < order.product_id.disk ||
            (newProduct.core === order.product_id.core &&
                newProduct.memory === order.product_id.memory &&
                newProduct.disk === order.product_id.disk)
        ) {
            return res.status(400).json({
                error: 'Gói mới phải có ít nhất một thông số lớn hơn gói hiện tại',
            });
        }

        const currentPricing = await Pricing.findOne({ service_id: order.product_id._id })
            .select('id price discount cycles_id')
            .populate({ path: 'cycles_id', select: 'id display_name unit value' })
            .sort({ price: 1 });
        if (!currentPricing) {
            return res.status(404).json({
                error: `Giá gói máy chủ #${order_id} không tồn tại`,
            });
        }

        const newPricing = await Pricing.findOne({ service_id: newProduct._id, status: true, cycles_id: order.pricing_id.cycles_id._id })
            .populate({ path: 'cycles_id', select: 'id value unit display_name' })
            .sort({ price: 1 });
        if (!newPricing) {
            return res.status(404).json({
                error: `Giá gói máy chủ #${product_id} không tồn tại`,
            });
        }

        const partner = await CloudServerPartner.findOne({}).select('url key password');
        if (!partner) {
            return res.status(500).json({ error: 'Máy chủ đang bảo trì hoặc không hoạt động' });
        }

        const wallet = await Wallet.findOne({ user_id: req.user._id, status: 'activated' }).select('total_balance');
        if (!wallet) {
            return res.status(400).json({ error: 'Ví của bạn không tồn tại hoặc đã bị khoá' });
        }

        // Số ngày còn lại
        const remainingDays = serviceCalculateRemainingDays(order.expired_at);

        // Số ngày trong tháng
        const daysInMonth = serviceGetDaysInCurrentMonth();

        // Số tiền cần trả nếu nâng cấp gói
        const totalPriceUpgrade = serviceCalculateUpgradeCost(currentPricing.price, newPricing.price, remainingDays, daysInMonth);

        // Giảm theo chiết khấu cho đối tác
        const priceAfterDiscount = totalPriceUpgrade * (1 - req.discount / 100);

        // Thời gian sử dụng cho gói nâng cấp (Tháng)
        const remainingRatio = serviceCalculateRemainingRatio(remainingDays, daysInMonth);

        if (wallet.total_balance < Math.round(priceAfterDiscount)) {
            return res.status(400).json({ error: 'Số dư ví không đủ để thanh toán' });
        }

        const dataPost = {
            editvps: 1,
            plid: newProduct.code,
        };

        serviceAuthManageVPS(partner.url, partner.key, partner.password, order.order_info.order_id, dataPost);

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            req.user._id,
            'service',
            'VND',
            'upgrade',
            [
                {
                    title: 'Nâng cấp Cloud Server',
                    description: `Phí nâng cấp Cloud Server #${order_id} thời gian ~${remainingRatio} Tháng`,
                    unit_price: Math.round(priceAfterDiscount),
                    quantity: 1,
                    fees: 0,
                    cycles: `~${remainingRatio} Tháng`,
                    discount: 0,
                    total_price: Math.round(priceAfterDiscount),
                },
            ],
            [],
            newPricing.bonus_point,
            -Math.round(priceAfterDiscount),
            -Math.round(priceAfterDiscount),
            'app_wallet',
            null,
            'Hoá đơn nâng cấp Cloud Server',
            true,
        );
        if (!newInvoice.success) {
            return res.status(400).json({
                error: 'Lỗi xử lý hoá đơn thanh toán',
            });
        }

        // Tạo đơn
        await new Order({
            user_id: req.user._id,
            invoice_id: newInvoice.data.id,
            products: [
                {
                    quantity: 1,
                    title: 'Nâng cấp Cloud Server',
                    description: `Nâng cấp Cloud Server #${order_id} thời gian ~${remainingRatio} Tháng`,
                    unit_price: Math.round(priceAfterDiscount),
                    discount: 0,
                    cycles: `~${remainingRatio} Tháng`,
                    data_url: null,
                    total_price: Math.round(priceAfterDiscount),
                    product_id: order._id,
                    product_type: 'OrderCloudServer',
                    pricing_id: newPricing._id,
                    module: 'upgrade',
                    cart_product_id: null,
                },
            ],
            coupons: [],
            status: 'completed',
            bonus_point: newPricing.bonus_point,
            total_price: Math.round(priceAfterDiscount),
            total_payment: Math.round(priceAfterDiscount),
            pay_method: 'app_wallet',
            description: '',
        }).save();

        order.status = 'resizing';
        order.updated_at = Date.now();
        order.product_id = newProduct._id;
        order.pricing_id = newPricing._id;
        order.override_price += Math.round(priceAfterDiscount);
        await order.save();

        const data = {
            id: order_id,
            plan: order.plan_id,
            status: order.status,
            method: order.method,
            image: order.image_id,
            region: order.region_id,
            product: {
                id: newProduct.id,
                ipv4: newProduct.ipv4,
                ipv6: newProduct.ipv6,
                disk: newProduct.disk,
                core: newProduct.core,
                title: newProduct.title,
                memory: newProduct.memory,
                customize: newProduct.customize,
                bandwidth: newProduct.bandwidth,
                description: newProduct.description,
                network_port: newProduct.network_port,
                network_speed: newProduct.network_speed,
                network_inter: newProduct.network_inter,
            },
            slug_url: order.slug_url,
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
            message: 'Nâng cấp cấu hình máy chủ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/resize.log', 'controlV2CloudServerResizeOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerGetResizeInfo, controlV2CloudServerResizeOrder };
