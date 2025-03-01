import { configCreateLog } from '~/configs';
import { OrderTemplate } from '~/models/orderTemplate';
import { serviceUserAddDomainToCloudflare, serviceUserCheckDomainStatusOnCloudflare } from '~/services/my/template/payment';

const serviceCronCloudflare = async () => {
    try {
        const orders = await OrderTemplate.find({ status: { $in: ['wait_confirm', 'pending'] } })
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'template_id', select: 'id title' })
            .populate({
                path: 'pricing_id',
                select: 'id service_id service_type cycles_id price discount other_fees bonus_point',
                populate: [
                    { path: 'service_id', select: 'id title' },
                    { path: 'cycles_id', select: 'id value unit display_name' },
                ],
            })
            .sort({ created_at: -1 });

        if (orders.length < 1) {
            return;
        }

        for (const order of orders) {
            const checkStatusDomain = await serviceUserCheckDomainStatusOnCloudflare(order.cloudflare.id);
            if (!checkStatusDomain.success) {
                continue;
            }

            if (checkStatusDomain.status === 1) {
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
                } = checkStatusDomain.data;

                order.status = 'pending';
                order.description = 'Đơn của bạn đang được thực hiện vui lòng chờ!';
                order.cloudflare = {
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
                };
            }
            if (checkStatusDomain.status === 2) {
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
                } = checkStatusDomain.data;

                order.admin_domain = '';
                order.status = 'wait_confirm';
                order.description = 'Vui lòng trỏ Nameservers gốc về Nameservers mới của chúng tôi!';
                order.cloudflare = {
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
                };
            }
            if (checkStatusDomain.status === 404) {
                const resultAddDomain = await serviceUserAddDomainToCloudflare(order.app_domain);
                if (!resultAddDomain.success || resultAddDomain.status !== 200) {
                    order.description = 'Tên miền của bạn chưa được kết nối đến Cloudflare của chúng tôi';
                    continue;
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

                order.status = 'wait_confirm';
                order.description = 'Vui lòng trỏ Nameservers gốc về Nameservers mới của chúng tôi!';
                order.cloudflare = {
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
                };
            }

            await order.save();
        }
    } catch (error) {
        configCreateLog('services/cron/cloudflare.log', 'serviceCronCloudflare', error.message);
    }
};

export { serviceCronCloudflare };
