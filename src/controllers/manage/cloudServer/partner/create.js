import { configCreateLog } from '~/configs';
import { CloudServerPartner } from '~/models/cloudServerPartner';

const controlAuthCreateCloudServerPartner = async (req, res) => {
    try {
        const { name, url, key, password, node_select, description } = req.body;

        const newPartner = await new CloudServerPartner({
            url,
            key,
            name,
            password,
            node_select,
            description,
        }).save();

        const data = {
            url,
            key,
            name,
            password,
            node_select,
            description,
            id: newPartner.id,
            key: newPartner._id,
            status: newPartner.status,
            created_at: newPartner.created_at,
            updated_at: newPartner.updated_at,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới đối tác #${newPartner.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/partner/create.log', 'controlAuthCreateCloudServerPartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateCloudServerPartner };
