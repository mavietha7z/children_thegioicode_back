import { Order } from '~/models/order';
import { Wallet } from '~/models/wallet';
import { Pricing } from '~/models/pricing';
import { Template } from '~/models/template';
import { OrderTemplate } from '~/models/orderTemplate';
import { configCreateLog, convertCurrency } from '~/configs';
import { serverUserCalculateExpired } from '~/services/user/calculate';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';
import { serviceCreateNotificationUser } from '~/services/user/notification';
import { serviceUserAddDomainToCloudflare } from '~/services/my/template/payment';

const controlUserPaymentTemplate = async (req, res) => {
    try {
        const { id, cycles: cycles_id, domain, email_admin, password_admin } = req.body;

        const wallet = await Wallet.findOne({ user_id: req.user.id });
        if (!wallet) {
            return res.status(400).json({ error: 'Ví của bạn không tồn tại hoặc đã bị khoá' });
        }

        const template = await Template.findOne({ id });
        if (!template) {
            return res.status(400).json({ error: 'Template muốn khởi tạo không tồn tại' });
        }

        const pricing = await Pricing.findOne({ id: cycles_id, service_id: template._id }).populate({ path: 'cycles_id' });
        if (!pricing) {
            return res.status(400).json({ error: 'Chu kỳ bạn muốn đăng ký không tồn tại' });
        }

        const expired_at = serverUserCalculateExpired(Date.now(), pricing.cycles_id.unit, pricing.cycles_id.value);
        if (!expired_at) {
            return res.status(400).json({ error: 'Lỗi tính toán chu kỳ sử dụng' });
        }

        const discountedPrice = pricing.price * (1 - pricing.discount / 100);

        const totalPrice = discountedPrice + pricing.creation_fee;
        if (wallet.total_balance < totalPrice) {
            return res.status(400).json({ error: 'Số dư ví không đủ để thanh toán' });
        }

        const resultAddDomain = await serviceUserAddDomainToCloudflare(domain);
        if (!resultAddDomain.success) {
            return res.status(400).json({ error: resultAddDomain.message });
        }

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            req.user.id,
            'service',
            'VND',
            'register',
            [
                {
                    title: 'Đăng ký đơn tạo website',
                    description: `Đăng ký đơn tạo website #${id} thời gian ${pricing.cycles_id.display_name}`,
                    unit_price: pricing.price,
                    quantity: 1,
                    fees: pricing.creation_fee,
                    cycles: pricing.cycles_id.display_name,
                    discount: pricing.discount,
                    total_price: totalPrice,
                },
            ],
            [],
            pricing.bonus_point,
            -pricing.price,
            -totalPrice,
            'app_wallet',
            null,
            'Hoá đơn đăng ký đơn tạo website',
            true,
        );
        if (!newInvoice.success) {
            return res.status(400).json({
                error: 'Lỗi xử lý hoá đơn thanh toán',
            });
        }

        const {
            plan,
            name,
            status,
            account,
            created_on,
            id: cloudID,
            modified_on,
            name_servers,
            activated_on,
            original_name_servers,
        } = resultAddDomain.data;

        const newOrderTemplate = await new OrderTemplate({
            user_id: req.user.id,
            template_id: template._id,
            pricing_id: pricing._id,
            invoice_id: [newInvoice.data.id],
            bonus_point: pricing.bonus_point,
            total_price: pricing.price,
            total_payment: totalPrice,
            auto_renew: false,
            status: 'wait_confirm',
            app_domain: domain,
            admin_domain: '',
            email_admin,
            password_admin,
            cloudflare: {
                plan,
                name,
                status,
                account,
                created_on,
                id: cloudID,
                modified_on,
                name_servers,
                activated_on,
                original_name_servers,
            },
            description: 'Vui lòng trỏ Nameservers gốc về Nameservers mới của chúng tôi!',
            expired_at,
        }).save();

        await new Order({
            user_id: req.user.id,
            invoice_id: newInvoice.data.id,
            products: [
                {
                    quantity: 1,
                    data_url: null,
                    title: 'Đăng ký đơn tạo website',
                    description: `Đăng ký đơn tạo website #${newOrderTemplate.id} thời gian ${pricing.cycles_id.display_name}`,
                    unit_price: pricing.price,
                    discount: pricing.discount,
                    cycles: pricing.cycles_id.display_name,
                    total_price: totalPrice,
                    product_id: newOrderTemplate._id,
                    product_type: 'OrderTemplate',
                    pricing_id: pricing._id,
                    module: 'register',
                    cart_product_id: null,
                },
            ],
            coupons: [],
            status: 'completed',
            bonus_point: pricing.bonus_point,
            total_price: pricing.price,
            total_payment: totalPrice,
            pay_method: 'app_wallet',
            description: '',
        }).save();

        template.view_count = template.view_count + 1;
        template.create_count = template.create_count + 1;
        template.save();

        // Thông báo email
        await serviceCreateNotificationUser(
            req.user.id,
            'Email',
            'Xác nhận đơn hàng tạo website',
            `Hệ thống đã tạo đơn thành công, Quý khách vui lòng truy cập đường dẫn sau để xác nhận đơn hàng theo yêu cầu: https://netcode.vn/billing/templates/${newOrderTemplate.id}.`,
            'Hoá đơn thanh toán đã xuất không thể hoàn tác.',
        );

        // Tạo thông web
        await serviceCreateNotificationUser(
            req.user.id,
            'Web',
            `Hoá đơn mã #${newInvoice.data.id} đã được xuất`,
            `Kính chào quý khách ${req.user.full_name}. Hoá đơn sử dụng dịch vụ số #${
                newInvoice.data.id
            } với tổng số tiền ${convertCurrency(
                Math.abs(newInvoice.data.total_payment),
            )} đã được thanh toán thành công. Xem thêm thông tin tại đường dẫn sau: https://netcode.vn/billing/invoices/${
                newInvoice.data.id
            }. Trân trọng!`,
        );

        res.status(200).json({
            status: 200,
            data: newOrderTemplate.id,
            message: 'Thanh toán và tạo đơn hàng thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/template/payment.log', 'controlUserPaymentTemplate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserPaymentTemplate };
