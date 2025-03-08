import { Order } from '~/models/order';
import { Wallet } from '~/models/wallet';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerProduct } from '~/models/cloudServerProduct';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';
import { servicePartnerResize, servicePartnerResizeInfo } from '~/services/partner/cloudServer';

import {
    serviceCalculateUpgradeCost,
    serviceGetDaysInCurrentMonth,
    serviceCalculateRemainingDays,
    serviceCalculateRemainingRatio,
} from '~/services/user/calculate';

const controlUserBillingResizeInstance = async (req, res) => {
    try {
        const { instance_id, product_id } = req.body;

        if (!isValidDataId(instance_id) || !isValidDataId(product_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const instance = await OrderCloudServer.findOne({ user_id: req.user.id, id: instance_id, status: { $nin: ['deleted', 'expired'] } })
            .populate({ path: 'region_id', select: 'id title' })
            .populate({ path: 'image_id', select: 'id title group image_url' })
            .populate({ path: 'product_id', select: 'id title core memory disk priority' })
            .populate({
                path: 'pricing_id',
                select: 'id price discount cycles_id',
                populate: { path: 'cycles_id', select: 'id value unit display_name' },
            });
        if (!instance) {
            return res.status(404).json({
                error: `Máy chủ #${instance_id} không tồn tại`,
            });
        }

        const newProduct = await CloudServerProduct.findOne({ plan_id: instance.plan.id, id: product_id, status: true });
        if (!newProduct) {
            return res.status(404).json({
                error: `Gói máy chủ #${product_id} không tồn tại`,
            });
        }

        if (
            newProduct.core < instance.product_id.core ||
            newProduct.memory < instance.product_id.memory ||
            newProduct.disk < instance.product_id.disk ||
            (newProduct.core === instance.product_id.core &&
                newProduct.memory === instance.product_id.memory &&
                newProduct.disk === instance.product_id.disk)
        ) {
            return res.status(400).json({
                error: 'Gói mới phải có ít nhất một thông số lớn hơn gói hiện tại',
            });
        }

        const currentPricing = await Pricing.findOne({ service_id: instance.product_id._id })
            .select('id price discount cycles_id')
            .populate({ path: 'cycles_id', select: 'id display_name unit value' })
            .sort({ price: 1 });

        if (!currentPricing) {
            return res.status(404).json({
                error: `Giá gói máy chủ #${instance_id} không tồn tại`,
            });
        }

        const newPricing = await Pricing.findOne({ service_id: newProduct._id, status: true })
            .populate({ path: 'cycles_id', select: 'id value unit display_name' })
            .sort({ price: 1 });
        if (!newPricing) {
            return res.status(404).json({
                error: `Giá gói máy chủ #${product_id} không tồn tại`,
            });
        }

        const wallet = await Wallet.findOne({ user_id: req.user.id, status: 'activated' }).select('total_balance');
        if (!wallet) {
            return res.status(400).json({ error: 'Ví của bạn không tồn tại hoặc đã bị khoá' });
        }

        // Số ngày còn lại
        const remainingDays = serviceCalculateRemainingDays(instance.expired_at);

        // Số ngày trong tháng
        const daysInMonth = serviceGetDaysInCurrentMonth();

        // Số tiền cần trả nếu nâng cấp gói
        const totalPriceUpgrade = serviceCalculateUpgradeCost(
            currentPricing.price * (1 - currentPricing.discount / 100),
            newPricing.price * (1 - newPricing.discount / 100),
            remainingDays,
            daysInMonth,
        );

        if (wallet.total_balance < totalPriceUpgrade) {
            return res.status(400).json({ error: 'Số dư ví không đủ để thanh toán' });
        }

        const resizeInfo = await servicePartnerResizeInfo(instance.order_info.order_id);
        if (resizeInfo.status !== 200) {
            return res.status(400).json({
                error: resizeInfo.error,
            });
        }

        const productUpgrade = resizeInfo.data.find((product) => product.id === newProduct.partner_id);
        if (!productUpgrade) {
            return res.status(404).json({
                error: 'Gói máy chủ nâng cấp không tồn tại',
            });
        }

        const dataPost = {
            product_id: newProduct.partner_id,
            order_id: instance.order_info.order_id,
        };

        const result = await servicePartnerResize(dataPost);
        if (result.status !== 200) {
            return res.status(400).json({
                error: result.error,
            });
        }

        // Thời gian sử dụng cho gói nâng cấp (Tháng)
        const remainingRatio = serviceCalculateRemainingRatio(remainingDays, daysInMonth);

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            req.user.id,
            'service',
            'VND',
            'upgrade',
            [
                {
                    title: 'Nâng cấp Cloud Server',
                    description: `Phí nâng cấp Cloud Server #${instance.id} thời gian ~${remainingRatio} Tháng`,
                    unit_price: totalPriceUpgrade,
                    quantity: 1,
                    fees: 0,
                    cycles: `~${remainingRatio} Tháng`,
                    discount: 0,
                    total_price: totalPriceUpgrade,
                },
            ],
            [],
            newPricing.bonus_point,
            -totalPriceUpgrade,
            -totalPriceUpgrade,
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
            user_id: req.user.id,
            invoice_id: newInvoice.data.id,
            products: [
                {
                    quantity: 1,
                    title: 'Nâng cấp Cloud Server',
                    description: `Nâng cấp Cloud Server #${instance.id} thời gian ~${remainingRatio} Tháng`,
                    unit_price: totalPriceUpgrade,
                    discount: 0,
                    cycles: `~${remainingRatio} Tháng`,
                    data_url: null,
                    total_price: totalPriceUpgrade,
                    product_id: instance._id,
                    product_type: 'OrderCloudServer',
                    pricing_id: newPricing._id,
                    module: 'upgrade',
                    cart_product_id: null,
                },
            ],
            coupons: [],
            status: 'completed',
            bonus_point: newPricing.bonus_point,
            total_price: totalPriceUpgrade,
            total_payment: totalPriceUpgrade,
            pay_method: 'app_wallet',
            description: '',
        }).save();

        instance.status = 'resizing';
        instance.updated_at = Date.now();
        instance.product_id = newProduct._id;
        instance.pricing_id = newPricing._id;
        instance.override_price += totalPriceUpgrade;
        await instance.save();

        res.status(200).json({
            data: true,
            status: 200,
            message: 'Đã gửi lệnh thực hiện thao tác thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/instance/resize.log', 'controlUserBillingRebuildInstance', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserBillingResizeInstance };
