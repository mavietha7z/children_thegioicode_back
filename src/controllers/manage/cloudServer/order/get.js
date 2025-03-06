import { configCreateLog } from '~/configs';
import { OrderCloudServer } from '~/models/orderCloudServer';

const controlAuthGetCloudServerOrders = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await OrderCloudServer.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const results = await OrderCloudServer.find({})
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'region_id', select: 'id title' })
            .populate({ path: 'image_id', select: 'id title image_url' })
            .populate({ path: 'product_id', select: 'id title core memory disk' })
            .populate({ path: 'pricing_id', select: 'id price' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                plan,
                status,
                method,
                _id: key,
                slug_url,
                auto_renew,
                cpu_usage,
                invoice_id,
                order_info,
                expired_at,
                created_at,
                updated_at,
                disk_usage,
                description,
                display_name,
                memory_usage,
                user_id: user,
                backup_server,
                override_price,
                image_id: image,
                bandwidth_usage,
                region_id: region,
                product_id: product,
                pricing_id: pricing,
            } = result;

            return {
                id,
                key,
                user,
                plan,
                image,
                status,
                region,
                method,
                product,
                pricing,
                slug_url,
                cpu_usage,
                auto_renew,
                invoice_id,
                order_info,
                expired_at,
                created_at,
                updated_at,
                disk_usage,
                description,
                memory_usage,
                display_name,
                backup_server,
                override_price,
                bandwidth_usage,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/order/get.log', 'controlAuthGetCloudServerOrders', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCloudServerOrders };
