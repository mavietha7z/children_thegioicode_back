import { configCreateLog } from '~/configs';
import { CloudServerPlan } from '~/models/cloudServerPlan';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlAuthCreateCloudServerProduct = async (req, res) => {
    try {
        const {
            ipv4,
            ipv6,
            core,
            code,
            disk,
            title,
            memory,
            commit,
            plan_id,
            support,
            priority,
            core_info,
            disk_info,
            customize,
            bandwidth,
            memory_info,
            description,
            network_port,
            network_inter,
            network_speed,
            customize_config,
        } = req.body;

        const plan = await CloudServerPlan.findById(plan_id).select('id title');
        if (!plan) {
            return res.status(400).json({ error: 'Máy chủ bạn chọn không tồn tại' });
        }

        const isProduct = await CloudServerProduct.findOne({ core, memory, disk, customize, code });
        if (isProduct) {
            return res.status(400).json({ error: 'Cấu hình này đã tồn tại' });
        }

        const newProduct = await new CloudServerProduct({
            ipv4,
            ipv6,
            code,
            core,
            disk,
            title,
            memory,
            commit,
            support,
            plan_id,
            priority,
            bandwidth,
            customize,
            disk_info,
            core_info,
            description,
            memory_info,
            network_port,
            network_inter,
            network_speed,
            customize_config,
        }).save();

        const data = {
            ipv4,
            ipv6,
            code,
            disk,
            core,
            plan,
            title,
            memory,
            commit,
            support,
            priority,
            customize,
            bandwidth,
            disk_info,
            core_info,
            pricing: 0,
            memory_info,
            description,
            network_port,
            network_speed,
            network_inter,
            customize_config,
            id: newProduct.id,
            key: newProduct._id,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: newProduct.status,
            sold_out: newProduct.sold_out,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới cấu hình #${newProduct.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/product/create.log', 'controlAuthCreateCloudServerProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateCloudServerProduct };
