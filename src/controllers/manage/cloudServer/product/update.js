import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { CloudServerPlan } from '~/models/cloudServerPlan';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlAuthUpdateCloudServerProduct = async (req, res) => {
    try {
        const { id, type } = req.query;

        if (!['info', 'status', 'sold_out'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const product = await CloudServerProduct.findById(id).populate({ path: 'plan_id', select: 'id title' });
        if (!product) {
            return res.status(404).json({ error: 'Cấu hình cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            product.status = !product.status;

            data = true;
            message = 'Bật/Tắt trạng thái cấu hình thành công';
        }
        if (type === 'sold_out') {
            product.sold_out = !product.sold_out;

            data = true;
            message = 'Bật/Tắt trạng thái hết hàng cấu hình thành công';
        }

        if (type === 'info') {
            const {
                ipv4,
                ipv6,
                code,
                core,
                disk,
                title,
                memory,
                commit,
                plan_id,
                support,
                priority,
                disk_info,
                customize,
                bandwidth,
                core_info,
                description,
                memory_info,
                network_port,
                network_speed,
                network_inter,
                customize_config,
            } = req.body;

            const plan = await CloudServerPlan.findById(plan_id).select('id title');
            if (!plan) {
                return res.status(400).json({ error: 'Máy chủ bạn chọn không tồn tại' });
            }

            product.ipv4 = ipv4;
            product.ipv6 = ipv6;
            product.disk = disk;
            product.code = code;
            product.core = core;
            product.title = title;
            product.memory = memory;
            product.commit = commit;
            product.plan_id = plan_id;
            product.support = support;
            product.priority = priority;
            product.bandwidth = bandwidth;
            product.customize = customize;
            product.core_info = core_info;
            product.disk_info = disk_info;
            product.description = description;
            product.memory_info = memory_info;
            product.network_port = network_port;
            product.network_speed = network_speed;
            product.network_inter = network_inter;

            const pricing = await Pricing.countDocuments({ service_id: product._id, service_type: 'CloudServerProduct' });

            data = {
                ipv4,
                ipv6,
                disk,
                plan,
                code,
                core,
                title,
                memory,
                commit,
                key: id,
                pricing,
                support,
                priority,
                customize,
                bandwidth,
                core_info,
                disk_info,
                description,
                memory_info,
                network_port,
                network_inter,
                network_speed,
                id: product.id,
                customize_config,
                status: product.status,
                updated_at: Date.now(),
                sold_out: product.sold_out,
                created_at: product.created_at,
            };

            message = `Cập nhật cấu hình #${product.id} thành công`;
        }

        product.updated_at = Date.now();
        await product.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/product/update.log', 'controlAuthUpdateCloudServerProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateCloudServerProduct };
