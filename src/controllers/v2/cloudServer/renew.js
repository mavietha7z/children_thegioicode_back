import moment from 'moment';
import { Order } from '~/models/order';
import { Wallet } from '~/models/wallet';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';
import { serverUserCalculateExpired, serviceCalculateTotalDiscount } from '~/services/user/calculate';

const controlV2CloudServerGetRenewInfo = async (req, res) => {
    try {
        const { order_id } = req.params;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({ error: 'ID đơn hàng máy chủ không hợp lệ' });
        }

        const order = await OrderCloudServer.findOne({ user_id: req.user._id, id: order_id, status: { $nin: ['deleted', 'expired'] } });
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng máy chủ không tồn tại' });
        }

        const pricings = await Pricing.find({ service_id: order.product_id, service_type: 'CloudServerProduct', status: true })
            .select('id price discount cycles_id renewal_fee')
            .populate({ path: 'cycles_id', select: 'id display_name unit value' });

        const data = pricings.map((pricing) => {
            const discountedPrice = pricing.price * (1 - pricing.discount / 100);
            const totalPrice = discountedPrice + pricing.renewal_fee;

            return {
                id: pricing.id,
                cycle: pricing.cycles_id.display_name,
                price: totalPrice * (1 - req.discount / 100),
            };
        });

        res.status(200).json({
            data,
            status: 200,
            message: 'Lấy thông tin gia hạn máy chủ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/renew.log', 'controlV2CloudServerGetRenewInfo', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlV2CloudServerRenewOrder = async (req, res) => {
    try {
        const { order_id, pricing_id } = req.body;

        if (!isValidDataId(order_id)) {
            return res.status(400).json({ error: 'ID đơn hàng máy chủ không hợp lệ' });
        }
        if (!isValidDataId(pricing_id)) {
            return res.status(400).json({ error: 'ID chu kỳ sử dung không hợp lệ' });
        }

        const order = await OrderCloudServer.findOne({ user_id: req.user._id, id: order_id, status: { $nin: ['deleted', 'expired'] } })
            .populate({ path: 'plan_id', select: '-_id id title image_url description' })
            .populate({ path: 'region_id', select: '-_id id title image_url description' })
            .populate({ path: 'image_id', select: '-_id id title group image_url description' })
            .populate({
                path: 'product_id',
                select: 'id title core memory disk bandwidth network_speed customize network_port network_inter ipv4 ipv6',
            });
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng máy chủ không tồn tại' });
        }

        const pricing = await Pricing.findOne({
            service_id: order.product_id._id,
            service_type: 'CloudServerProduct',
            id: pricing_id,
            status: true,
        })
            .select('id price discount cycles_id renewal_fee')
            .populate({ path: 'cycles_id', select: 'id display_name unit value' });
        if (!pricing) {
            return res.status(404).json({ error: 'Giá chu kỳ muốn gia hạn không tồn tại' });
        }

        const wallet = await Wallet.findOne({ user_id: req.user._id, status: 'activated' }).select('total_balance');
        if (!wallet) {
            return res.status(400).json({ error: 'Ví của bạn không tồn tại hoặc đã bị khoá' });
        }

        const discountedPrice = pricing.price * (1 - pricing.discount / 100);
        const totalPrice = discountedPrice + pricing.renewal_fee;

        const resultPrice = totalPrice * (1 - req.discount / 100);
        if (wallet.total_balance < resultPrice) {
            return res.status(400).json({ error: 'Số dư ví không đủ để thanh toán' });
        }

        const expired_at = serverUserCalculateExpired(order.expired_at, pricing.cycles_id.unit, pricing.cycles_id.value);
        if (!expired_at) {
            return res.status(400).json({ error: 'Lỗi tính toán chu kỳ sử dụng' });
        }

        const totalDiscount = serviceCalculateTotalDiscount(pricing.discount, req.discount);

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            req.user._id,
            'service',
            'VND',
            'renew',
            [
                {
                    title: 'Gia hạn Cloud Server',
                    description: `Gia hạn Cloud Server #${order_id} thời gian ${pricing.cycles_id.display_name}`,
                    unit_price: pricing.price,
                    quantity: 1,
                    fees: 0,
                    cycles: pricing.cycles_id.display_name,
                    discount: totalDiscount,
                    total_price: resultPrice,
                },
            ],
            [],
            pricing.bonus_point,
            -pricing.price,
            -resultPrice,
            'app_wallet',
            null,
            'Hoá đơn gia hạn Cloud Server',
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
                    title: 'Gia hạn Cloud Server',
                    description: `Gia hạn Cloud Server #${order_id} thời gian ${pricing.cycles_id.display_name}`,
                    unit_price: pricing.price,
                    discount: totalDiscount,
                    cycles: pricing.cycles_id.display_name,
                    data_url: null,
                    total_price: resultPrice,
                    product_id: order._id,
                    product_type: 'OrderCloudServer',
                    pricing_id: pricing._id,
                    module: 'renew',
                    cart_product_id: null,
                },
            ],
            coupons: [],
            status: 'completed',
            bonus_point: pricing.bonus_point,
            total_price: pricing.price,
            total_payment: resultPrice,
            pay_method: 'app_wallet',
            description: '',
        }).save();

        order.expired_at = expired_at;
        order.updated_at = Date.now();
        order.pricing_id = pricing._id;
        order.override_price += resultPrice;
        order.invoice_id = [...order.invoice_id, newInvoice.data.id];
        await order.save();

        const data = {
            id: order_id,
            plan: order.plan_id,
            status: order.status,
            method: order.method,
            image: order.image_id,
            region: order.region_id,
            product: {
                id: order.product_id.id,
                ipv4: order.product_id.ipv4,
                ipv6: order.product_id.ipv6,
                core: order.product_id.core,
                disk: order.product_id.disk,
                title: order.product_id.title,
                memory: order.product_id.memory,
                customize: order.product_id.customize,
                bandwidth: order.product_id.bandwidth,
                network_port: order.product_id.network_port,
                network_speed: order.product_id.network_speed,
                network_inter: order.product_id.network_inter,
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
            message: 'Gia hạn máy chủ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/v2/cloudServer/renew.log', 'controlV2CloudServerRenewOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlV2CloudServerGetRenewInfo, controlV2CloudServerRenewOrder };
