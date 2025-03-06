import { configCreateLog } from '~/configs';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { servicePartnerGetOrderDetail } from '../partner/cloudServer';

const serviceCronCloudServer = async () => {
    try {
        const orders = await OrderCloudServer.find({
            status: { $nin: ['deleted', 'expired'] },
        })
            .select('order_info status bandwidth_usage disk_usage cpu_usage memory_usage updated_at')
            .sort({ created_at: -1 });

        if (orders.length < 1) {
            return;
        }

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];

            const result = await servicePartnerGetOrderDetail(order.order_info.order_id);
            if (result.status !== 200) {
                continue;
            }

            order.updated_at = Date.now();
            order.status = result.data.status;
            order.cpu_usage = result.data.cpu_usage;
            order.disk_usage = result.data.disk_usage;
            order.memory_usage = result.data.memory_usage;
            order.bandwidth_usage = result.data.bandwidth_usage;

            await order.save();
        }
    } catch (error) {
        configCreateLog('services/cron/cloudServer.log', 'serviceCronCloudServer', error.message);
    }
};

export { serviceCronCloudServer };
