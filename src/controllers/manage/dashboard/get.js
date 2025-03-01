import { User } from '~/models/user';
import { Order } from '~/models/order';
import { Source } from '~/models/source';
import { Invoice } from '~/models/invoice';
import { Request } from '~/models/request';
import { configCreateLog } from '~/configs';
import { LoginHistory } from '~/models/loginHistory';
import { OrderTemplate } from '~/models/orderTemplate';
import { OrderCloudServer } from '~/models/orderCloudServer';

const controlAuthGetDataDashboard = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // User
        const userTotal = await User.countDocuments({});
        const userToday = await User.countDocuments({ created_at: { $gte: startOfToday, $lte: endOfToday } });
        const users = await User.find({}).select('id email username full_name register_type created_at').limit(6).sort({ created_at: -1 });

        // Invoice
        const invoiceTotal = await Invoice.countDocuments({});
        const invoiceToday = await Invoice.countDocuments({ created_at: { $gte: startOfToday, $lte: endOfToday } });
        const invoices = await Invoice.find({})
            .select('id user_id type currency recurring_type status total_price total_payment pay_method created_at')
            .populate({ path: 'user_id', select: 'id email full_name' })
            .limit(6)
            .sort({ created_at: -1 });

        // Order
        const orderTotal = await Order.countDocuments({});
        const orderToday = await Order.countDocuments({ created_at: { $gte: startOfToday, $lte: endOfToday } });
        const orders = await Order.find({})
            .select('id user_id status total_price total_payment pay_method created_at')
            .populate({ path: 'user_id', select: 'id email full_name' })
            .limit(6)
            .sort({ created_at: -1 });

        // Instance
        const instanceTotal = await OrderCloudServer.countDocuments({});
        const instanceToday = await OrderCloudServer.countDocuments({ created_at: { $gte: startOfToday, $lte: endOfToday } });
        const instances = await OrderCloudServer.find({})
            .select('id user_id image_id product_id status method created_at expired_at')
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'product_id', select: 'id core memory disk' })
            .populate({ path: 'image_id', select: 'id title' })
            .limit(6)
            .sort({ created_at: -1 });

        // Source
        const sourceTotal = await Source.countDocuments({});
        const sourceToday = await Source.countDocuments({ created_at: { $gte: startOfToday, $lte: endOfToday } });

        // Template
        const templateTotal = await OrderTemplate.countDocuments({});
        const templateToday = await OrderTemplate.countDocuments({ created_at: { $gte: startOfToday, $lte: endOfToday } });
        const templates = await OrderTemplate.find({})
            .select('id user_id template_id status app_domain created_at expired_at')
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'template_id', select: 'id title' })
            .limit(6)
            .sort({ created_at: -1 });

        // Request
        const requests = await Request.find({})
            .select('id user_id service_id method status created_at')
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'service_id', select: 'id title category' })
            .limit(6)
            .sort({ created_at: -1 });

        // Login history
        const login_histories = await LoginHistory.find({})
            .select('id user_id ip address device created_at')
            .populate({ path: 'user_id', select: 'id email full_name' })
            .limit(20)
            .sort({ created_at: -1 });

        const data = {
            statistic: {
                user: {
                    total: userTotal,
                    today: userToday,
                },
                invoice: {
                    total: invoiceTotal,
                    today: invoiceToday,
                },
                order: {
                    total: orderTotal,
                    today: orderToday,
                },
                instance: {
                    total: instanceTotal,
                    today: instanceToday,
                },
                source: {
                    total: sourceTotal,
                    today: sourceToday,
                },
                template: {
                    total: templateTotal,
                    today: templateToday,
                },
            },
            users,
            orders,
            invoices,
            requests,
            instances,
            templates,
            login_histories,
        };
        res.status(200).json({
            data,
            status: 200,
            message: 'Lấy dữ liệu dashboard thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/dashboard/get.log', 'controlAuthGetDataDashboard', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetDataDashboard };
