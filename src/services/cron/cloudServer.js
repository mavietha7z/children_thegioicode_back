import { configCreateLog } from '~/configs';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { serviceAuthGetStatusVPS } from '../virtualizor/api';
import { CloudServerPartner } from '~/models/cloudServerPartner';

function getVpsStatus(vpsIds, result) {
    const statuses = {};
    vpsIds.forEach((vpsId) => {
        if (result.status[vpsId]) {
            statuses[vpsId] = result.status[vpsId];
        }
    });
    return statuses;
}
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

        const partner = await CloudServerPartner.findOne({}).select('id url key password');
        if (!partner) {
            return;
        }
        const orderIds = orders.map((order) => order.order_info.order_id);

        const result = await serviceAuthGetStatusVPS(partner.url, partner.key, partner.password, orderIds);

        const statuses = getVpsStatus(orderIds, result);

        for (const order of orders) {
            const status = statuses[order.order_info.order_id];
            if (!status) {
                continue;
            }

            // Cập nhật trạng thái VPS
            if (status.status === 1) {
                order.status = 'activated';
            }
            if (
                status.status === 0 &&
                order.status !== 'starting' &&
                order.status !== 'restarting' &&
                order.status !== 'rebuilding' &&
                order.status !== 'resizing'
            ) {
                order.status = 'stopped';
            }
            if (
                status.status === 2 &&
                order.status !== 'starting' &&
                order.status !== 'restarting' &&
                order.status !== 'rebuilding' &&
                order.status !== 'resizing'
            ) {
                order.status = 'suspended';
            }

            // Cập nhật các thông tin khác
            order.cpu_usage = status.used_cpu;
            order.disk_usage = status.used_disk;
            order.memory_usage = status.used_ram;
            order.bandwidth_usage = status.used_bandwidth;
            order.updated_at = Date.now();

            await order.save();
        }
    } catch (error) {
        configCreateLog('services/cron/cloudServer.log', 'serviceCronCloudServer', error.message);
    }
};

export { serviceCronCloudServer };
