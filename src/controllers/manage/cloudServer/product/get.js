import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { CloudServerProduct } from '~/models/cloudServerProduct';

const controlAuthGetCloudServerProduct = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await CloudServerProduct.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const products = await CloudServerProduct.find(objectQuery)
            .populate({ path: 'plan_id', select: 'id title' })
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const data = await Promise.all(
            products.map(async (product) => {
                const {
                    id,
                    disk,
                    core,
                    ipv4,
                    ipv6,
                    code,
                    title,
                    memory,
                    status,
                    commit,
                    support,
                    _id: key,
                    sold_out,
                    priority,
                    bandwidth,
                    disk_info,
                    core_info,
                    customize,
                    created_at,
                    updated_at,
                    memory_info,
                    description,
                    network_port,
                    network_speed,
                    network_inter,
                    plan_id: plan,
                    customize_config,
                } = product;

                const pricing = await Pricing.countDocuments({ service_id: product._id, service_type: 'CloudServerProduct' });

                return {
                    id,
                    key,
                    ipv4,
                    ipv6,
                    disk,
                    code,
                    core,
                    plan,
                    title,
                    memory,
                    status,
                    commit,
                    pricing,
                    support,
                    priority,
                    sold_out,
                    bandwidth,
                    disk_info,
                    customize,
                    core_info,
                    created_at,
                    updated_at,
                    memory_info,
                    description,
                    network_port,
                    network_speed,
                    network_inter,
                    customize_config,
                };
            }),
        );

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/product/get.log', 'controlAuthGetCloudServerProduct', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCloudServerProduct };
