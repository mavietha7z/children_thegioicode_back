import moment from 'moment';

import { Order } from '~/models/order';
import { Wallet } from '~/models/wallet';
import { OrderTemplate } from '~/models/orderTemplate';
import { configCreateLog, convertCurrency } from '~/configs';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { serverUserCalculateExpired } from '../user/calculate';
import { CloudServerPartner } from '~/models/cloudServerPartner';
import { serviceUserCreateNewInvoice } from '../user/createInvoice';
import { serviceCreateNotificationUser } from '../user/notification';
import { serviceAuthRemoveDomainFromCloudflare } from '../my/template/payment';
import { sendMessageBotTelegramApp, sendMessageBotTelegramError } from '~/bot';
import { serviceAuthDeleteVPS, serviceAuthSuspendAndUnsuspendVPS } from '../virtualizor/api';

const serviceAutoRenewOrderTemplate = async (order) => {
    try {
        const wallet = await Wallet.findOne({ user_id: order.user_id._id }).select('total_balance');
        if (!wallet) {
            return;
        }

        const discountedPrice = order.pricing_id.price * (1 - order.pricing_id.discount / 100);

        const totalPrice = discountedPrice + order.pricing_id.renewal_fee;
        if (wallet.total_balance < totalPrice) {
            // Thông báo email
            await serviceCreateNotificationUser(
                order.user_id._id,
                'Email',
                'Số dư ví không đủ thanh toán',
                `Quý khách đang có đơn tạo website sắp hết hạn và đã bật gia hạn tự động nhưng số dư ví không đủ để thanh toán. Quý khách chủ động gia hạn tại đường dẫn: https://thegioicode.com/billing/templates/${order.id}`,
                'Dịch vụ sẽ chuyển trạng thái hết hạn và bị xoá sau 1 ngày nếu quý khách không chủ động gia hạn.',
            );

            // Tạo thông web
            await serviceCreateNotificationUser(
                order.user_id._id,
                'Web',
                'Số dư ví không đủ thanh toán',
                `Kính chào quý khách ${order.user_id.full_name}. Quý khách đang có đơn tạo website sắp hết hạn và đã bật gia hạn tự động nhưng số dư ví không đủ để thanh toán. Quý khách chủ động gia hạn tại đường dẫn: https://thegioicode.com/billing/templates/${order.id}. Trân trọng!`,
            );

            order.status = 'expired';
            order.updated_at = Date.now();
            await order.save();

            // Bot telegram
            sendMessageBotTelegramApp(
                `Khác hàng: \n ${order.user_id.email} \n ${order.user_id.full_name} \n\n Đơn hàng OrderTemplate #${order.id} tự động gia hạn nhưng số dư ví không đủ thanh toán`,
            );

            return;
        }

        const expired_at = serverUserCalculateExpired(order.expired_at, order.pricing_id.cycles_id.unit, order.pricing_id.cycles_id.value);
        if (!expired_at) {
            order.status = 'expired';
            order.updated_at = Date.now();
            await order.save();

            return;
        }

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            order.user_id._id,
            'service',
            'VND',
            'renew',
            [
                {
                    title: 'Gia hạn đơn tạo website',
                    description: `Gia hạn đơn tạo website #${order.id} thời gian ${order.pricing_id.cycles_id.display_name}`,
                    unit_price: order.pricing_id.price,
                    quantity: 1,
                    fees: order.pricing_id.renewal_fee,
                    cycles: order.pricing_id.cycles_id.display_name,
                    discount: order.pricing_id.discount,
                    total_price: totalPrice,
                },
            ],
            [],
            order.pricing_id.bonus_point,
            -order.pricing_id.price,
            -totalPrice,
            'app_wallet',
            null,
            'Hoá đơn gia hạn đơn tạo website',
            true,
        );
        if (!newInvoice.success) {
            order.status = 'expired';
            order.updated_at = Date.now();
            await order.save();

            return;
        }

        // Tạo đơn
        const newOrder = await new Order({
            user_id: order.user_id._id,
            invoice_id: newInvoice.data.id,
            products: [
                {
                    quantity: 1,
                    title: 'Gia hạn đơn tạo website',
                    description: `Gia hạn đơn tạo website #${order.id} thời gian ${order.pricing_id.cycles_id.display_name}`,
                    unit_price: order.pricing_id.price,
                    discount: order.pricing_id.discount,
                    cycles: order.pricing_id.cycles_id.display_name,
                    data_url: null,
                    total_price: totalPrice,
                    product_id: order._id,
                    product_type: 'OrderTemplate',
                    pricing_id: order.pricing_id._id,
                    module: 'renew',
                    cart_product_id: null,
                },
            ],
            coupons: [],
            status: 'pending',
            bonus_point: order.pricing_id.bonus_point,
            total_price: order.pricing_id.price,
            total_payment: totalPrice,
            pay_method: 'app_wallet',
            description: '',
        }).save();

        order.expired_at = expired_at;
        order.updated_at = Date.now();
        order.pricing_id = order.pricing_id._id;
        order.total_payment = order.total_payment + totalPrice;
        order.invoice_id = [...order.invoice_id, newInvoice.data.id];
        order.bonus_point = order.bonus_point + order.pricing_id.bonus_point;
        order.total_price = order.total_price + Math.abs(newInvoice.data.total_price);
        await order.save();

        newOrder.status = 'completed';
        newOrder.paid_at = Date.now();
        newOrder.updated_at = Date.now();
        await newOrder.save();

        // Thông báo email
        await serviceCreateNotificationUser(
            order.user_id._id,
            'Email',
            'Tự động gia hạn dịch vụ',
            `Quý khách có đơn tạo website đã hết hạn và được gia hạn tự động thành công. Xem thêm thông tin tại: https://thegioicode.com/billing/orders/${newOrder.id}`,
            'Hoá đơn gia hạn đã xuất không thể hoàn tác.',
        );

        // Tạo thông web
        await serviceCreateNotificationUser(
            order.user_id._id,
            'Web',
            `Hoá đơn mã #${newInvoice.data.id} đã được xuất`,
            `Kính chào quý khách ${order.user_id.full_name}. Hoá đơn sử dụng dịch vụ số #${
                newInvoice.data.id
            } với tổng số tiền ${convertCurrency(
                Math.abs(newInvoice.data.total_payment),
            )} đã được thanh toán thành công. Xem thêm thông tin tại: https://thegioicode.com/billing/invoices/${
                newInvoice.data.id
            }. Trân trọng!`,
        );

        // Bot telegram
        sendMessageBotTelegramApp(
            `Khác hàng: \n ${order.user_id.email} \n ${order.user_id.full_name} \n\n Đơn hàng OrderTemplate #${order.id} tự động gia hạn thành công. Mã hoá đơn #${newInvoice.data.id}`,
        );
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi tự động gia hạn OrderTemplate: \n ${error.message}`);
        configCreateLog('services/cron/expired.log', 'serviceAutoRenewOrderTemplate', error.message);
    }
};

const serviceAutoRenewOrderCloudServer = async (order) => {
    try {
        const wallet = await Wallet.findOne({ user_id: order.user_id._id }).select('total_balance');
        if (!wallet) {
            return;
        }

        const discountedPrice = order.pricing_id.price * (1 - order.pricing_id.discount / 100);

        const totalPrice = discountedPrice + order.pricing_id.renewal_fee;
        if (wallet.total_balance < totalPrice) {
            // Thông báo email
            await serviceCreateNotificationUser(
                order.user_id._id,
                'Email',
                'Số dư ví không đủ thanh toán',
                `Quý khách đang có đơn máy chủ sắp hết hạn và đã bật gia hạn tự động nhưng số dư ví không đủ để thanh toán. Quý khách chủ động gia hạn tại đường dẫn: https://thegioicode.com/billing/instances/${order.id}`,
                'Máy chủ sẽ chuyển trạng thái hết hạn và bị xoá sau 1 ngày nếu quý khách không chủ động gia hạn.',
            );

            // Tạo thông web
            await serviceCreateNotificationUser(
                order.user_id._id,
                'Web',
                'Số dư ví không đủ thanh toán',
                `Kính chào quý khách ${order.user_id.full_name}. Quý khách đang có đơn máy chủ sắp hết hạn và đã bật gia hạn tự động nhưng số dư ví không đủ để thanh toán. Quý khách chủ động gia hạn tại đường dẫn: https://thegioicode.com/billing/instances/${order.id}. Trân trọng!`,
            );

            order.status = 'expired';
            order.updated_at = Date.now();
            await order.save();

            // Bot telegram
            sendMessageBotTelegramApp(
                `Khác hàng: \n ${order.user_id.email} \n ${order.user_id.full_name} \n\n Đơn hàng OrderCloudServer #${order.id} tự động gia hạn nhưng số dư ví không đủ thanh toán`,
            );

            return;
        }

        const expired_at = serverUserCalculateExpired(order.expired_at, order.pricing_id.cycles_id.unit, order.pricing_id.cycles_id.value);
        if (!expired_at) {
            order.status = 'expired';
            order.updated_at = Date.now();
            await order.save();

            return;
        }

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            order.user_id._id,
            'service',
            'VND',
            'renew',
            [
                {
                    title: 'Gia hạn Cloud Server',
                    description: `Gia hạn Cloud Server #${order.id} thời gian ${order.pricing_id.cycles_id.display_name}`,
                    unit_price: order.pricing_id.price,
                    quantity: 1,
                    fees: order.pricing_id.renewal_fee,
                    cycles: order.pricing_id.cycles_id.display_name,
                    discount: order.pricing_id.discount,
                    total_price: totalPrice,
                },
            ],
            [],
            order.pricing_id.bonus_point,
            -order.pricing_id.price,
            -totalPrice,
            'app_wallet',
            null,
            'Hoá đơn gia hạn Cloud Server',
            true,
        );
        if (!newInvoice.success) {
            order.status = 'expired';
            order.updated_at = Date.now();
            await order.save();

            return;
        }

        // Tạo đơn
        const newOrder = await new Order({
            user_id: order.user_id._id,
            invoice_id: newInvoice.data.id,
            products: [
                {
                    quantity: 1,
                    title: 'Gia hạn Cloud Server',
                    description: `Gia hạn Cloud Server #${order.id} thời gian ${order.pricing_id.cycles_id.display_name}`,
                    unit_price: order.pricing_id.price,
                    discount: order.pricing_id.discount,
                    cycles: order.pricing_id.cycles_id.display_name,
                    data_url: null,
                    total_price: totalPrice,
                    product_id: order._id,
                    product_type: 'OrderCloudServer',
                    pricing_id: order.pricing_id._id,
                    module: 'renew',
                    cart_product_id: null,
                },
            ],
            coupons: [],
            status: 'pending',
            bonus_point: order.pricing_id.bonus_point,
            total_price: order.pricing_id.price,
            total_payment: totalPrice,
            pay_method: 'app_wallet',
            description: '',
        }).save();

        order.expired_at = expired_at;
        order.updated_at = Date.now();
        order.invoice_id = [...order.invoice_id, newInvoice.data.id];
        order.override_price = order.override_price + totalPrice;
        await order.save();

        newOrder.status = 'completed';
        newOrder.paid_at = Date.now();
        newOrder.updated_at = Date.now();
        await newOrder.save();

        // Thông báo email
        await serviceCreateNotificationUser(
            order.user_id._id,
            'Email',
            'Tự động gia hạn dịch vụ',
            `Quý khách có đơn máy chủ đã hết hạn và được gia hạn tự động thành công. Xem thêm thông tin tại: https://thegioicode.com/billing/orders/${newOrder.id}`,
            'Hoá đơn gia hạn đã xuất không thể hoàn tác.',
        );

        // Tạo thông web
        await serviceCreateNotificationUser(
            order.user_id._id,
            'Web',
            `Hoá đơn mã #${newInvoice.data.id} đã được xuất`,
            `Kính chào quý khách ${order.user_id.full_name}. Hoá đơn sử dụng dịch vụ số #${
                newInvoice.data.id
            } với tổng số tiền ${convertCurrency(
                Math.abs(newInvoice.data.total_payment),
            )} đã được thanh toán thành công. Xem thêm thông tin tại: https://thegioicode.com/billing/invoices/${
                newInvoice.data.id
            }. Trân trọng!`,
        );

        // Bot telegram
        sendMessageBotTelegramApp(
            `Khác hàng: \n ${order.user_id.email} \n ${order.user_id.full_name} \n\n Đơn hàng OrderCloudServer #${order.id} tự động gia hạn thành công. Mã hoá đơn #${newInvoice.data.id}`,
        );
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi tự động gia hạn Cloud Server: \n ${error.message}`);
        configCreateLog('services/cron/expired.log', 'serviceAutoRenewOrderCloudServer', error.message);
    }
};

const serviceCronExpiredOrders = async () => {
    try {
        const currentTime = new Date();

        const orderTemplates = await OrderTemplate.find({ status: { $ne: 'deleted' } })
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'template_id', select: 'id title' })
            .populate({
                path: 'pricing_id',
                populate: { path: 'cycles_id' },
            })
            .sort({ created_at: -1 });

        const orderCloudServers = await OrderCloudServer.find({ try_it: false, status: { $ne: 'deleted' } })
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({
                path: 'pricing_id',
                populate: { path: 'cycles_id' },
            })
            .sort({ created_at: -1 });

        // Tạo website
        for (const order of orderTemplates) {
            // Tính giờ còn lại
            const expiredAt = new Date(order.expired_at);
            const timeLeft = moment(expiredAt).diff(currentTime, 'hours');

            // Nếu còn dưới 1 ngày gửi cảnh báo
            if (timeLeft <= 48 && timeLeft > 0) {
                const currentTime = moment();
                const expiredAt = moment(order.expired_at);
                const duration = moment.duration(expiredAt.diff(currentTime));

                // Lấy các giá trị thời gian còn lại
                const hoursLeft = duration.hours();
                const minutesLeft = duration.minutes();

                // Thông báo email
                await serviceCreateNotificationUser(
                    order.user_id._id,
                    'Email',
                    'Thông báo dịch vụ sắp hết hạn',
                    `Quý khách đang có đơn tạo website sắp hết hạn, thời gian còn lại ngày ${hoursLeft} giờ ${minutesLeft} phút. Quý khách chủ động gia hạn tại đường dẫn: https://thegioicode.com/billing/templates/${order.id}`,
                    'Dịch vụ sẽ chuyển trạng thái hết hạn và bị xoá sau 1 ngày.',
                );

                // Tạo thông web
                await serviceCreateNotificationUser(
                    order.user_id._id,
                    'Web',
                    'Thông báo dịch vụ sắp hết hạn',
                    `Kính chào quý khách ${order.user_id.full_name}. Quý khách đang có đơn tạo website sắp hết hạn, thời gian còn lại ngày ${hoursLeft} giờ ${minutesLeft} phút. Quý khách chủ động gia hạn tại đường dẫn: https://thegioicode.com/billing/templates/${order.id}. Trân trọng!`,
                );
            }

            // Mới hết hạn
            if (expiredAt < currentTime && order.status !== 'expired' && order.status !== 'deleted') {
                if (order.auto_renew) {
                    // Hết hạn và bật tự động gia hạn

                    await serviceAutoRenewOrderTemplate(order);
                } else {
                    // Hết hạn và không bật tự động gia hạn

                    // Bot telegram
                    sendMessageBotTelegramApp(
                        `Khác hàng: \n ${order.user_id.email} \n ${order.user_id.full_name} \n\n Đơn hàng OrderTemplate #${order.id} đã hết hạn`,
                    );

                    order.status = 'expired';
                    order.updated_at = Date.now();
                    await order.save();
                }
            }

            // Hết hạn 24 giờ
            if (timeLeft <= -24 && order.status === 'expired') {
                order.status = 'deleted';
                order.updated_at = Date.now();
                await order.save();

                await serviceAuthRemoveDomainFromCloudflare(order.cloudflare.id);
            }
        }

        // Cloud server
        for (const order of orderCloudServers) {
            // Tính giờ còn lại
            const expiredAt = new Date(order.expired_at);
            const timeLeft = moment(expiredAt).diff(currentTime, 'hours');

            // Nếu còn dưới 1 ngày gửi cảnh báo
            if (timeLeft <= 48 && timeLeft > 0) {
                const currentTime = moment();
                const expiredAt = moment(order.expired_at);
                const duration = moment.duration(expiredAt.diff(currentTime));

                // Lấy các giá trị thời gian còn lại
                const hoursLeft = duration.hours();
                const minutesLeft = duration.minutes();

                // Thông báo email
                await serviceCreateNotificationUser(
                    order.user_id._id,
                    'Email',
                    'Thông báo máy chủ sắp bị xóa',
                    `Quý khách đang có đơn máy chủ sắp hết hạn, thời gian còn lại ngày ${hoursLeft} giờ ${minutesLeft} phút. Quý khách chủ động gia hạn tại đường dẫn: https://thegioicode.com/billing/instances/${order.id}`,
                    'Máy chủ sẽ chuyển trạng thái hết hạn và bị xoá sau 1 ngày.',
                );

                // Tạo thông web
                await serviceCreateNotificationUser(
                    order.user_id._id,
                    'Web',
                    'Thông báo dịch vụ sắp hết hạn',
                    `Kính chào quý khách ${order.user_id.full_name}. Quý khách đang có đơn máy chủ sắp hết hạn, thời gian còn lại ngày ${hoursLeft} giờ ${minutesLeft} phút. Quý khách chủ động gia hạn tại đường dẫn: https://thegioicode.com/billing/instances/${order.id}. Trân trọng!`,
                );
            }

            // Mới hết hạn
            if (expiredAt < currentTime && order.status !== 'expired' && order.status !== 'deleted') {
                if (order.auto_renew) {
                    // Hết hạn và bật tự động gia hạn

                    await serviceAutoRenewOrderCloudServer(order);
                } else {
                    // Hết hạn và không bật tự động gia hạn

                    order.status = 'expired';
                    order.updated_at = Date.now();
                    await order.save();

                    // Khoá máy chủ
                    await serviceAuthSuspendAndUnsuspendVPS(
                        partner.url,
                        partner.key,
                        partner.password,
                        order.order_info.order_id,
                        'suspend',
                    );

                    // Bot telegram
                    sendMessageBotTelegramApp(
                        `Khác hàng: \n ${order.user_id.email} \n ${order.user_id.full_name} \n\n Đơn hàng OrderCloudServer #${order.id} đã hết hạn`,
                    );
                }
            }

            // Hết hạn 24 giờ
            if (timeLeft <= -24 && order.status === 'expired') {
                order.status = 'deleted';
                order.updated_at = Date.now();
                await order.save();

                const partner = await CloudServerPartner.findOne({}).select('id url key password');
                if (partner) {
                    await serviceAuthDeleteVPS(partner.url, partner.key, partner.password, order.order_info.order_id);
                }
            }
        }
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi cron Order: \n ${error.message}`);
        configCreateLog('services/cron/expired.log', 'serviceCronExpiredOrders', error.message);
    }
};

const serviceCronExpiredBonusPoints = async () => {
    try {
        const wallets = await Wallet.find({ bonus_point_expiry: { $exists: true, $ne: null } });
        if (wallets.length === 0) {
            return;
        }

        const currentTime = new Date();
        for (const wallet of wallets) {
            const expiredAt = new Date(wallet.bonus_point_expiry);

            if (expiredAt < currentTime) {
                wallet.bonus_point = 0;
                wallet.bonus_point_expiry = null;

                await wallet.save();
            }
        }
    } catch (error) {
        sendMessageBotTelegramError(`Lỗi cron điểm thưởng hết hạn: \n ${error.message}`);
        configCreateLog('services/cron/expired.log', 'serviceCronExpiredBonusPoints', error.message);
    }
};

export { serviceCronExpiredOrders, serviceCronExpiredBonusPoints };
