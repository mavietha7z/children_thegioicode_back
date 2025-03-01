import { configCreateLog } from '~/configs';
import { CloudServerPartner } from '~/models/cloudServerPartner';

const controlAuthUpdateCloudServerPartner = async (req, res) => {
    try {
        const { id, type } = req.query;

        const cloudServerPartner = await CloudServerPartner.findById(id);
        if (!cloudServerPartner) {
            return res.status(404).json({ error: 'Đối tác cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            cloudServerPartner.status = !cloudServerPartner.status;

            data = true;
            message = 'Bật/Tắt trạng thái đối tác thành công';
        }

        if (type === 'info') {
            const { name, url, key, password, node_select, description } = req.body;

            cloudServerPartner.url = url;
            cloudServerPartner.key = key;
            cloudServerPartner.name = name;
            cloudServerPartner.password = password;
            cloudServerPartner.node_select = node_select;
            cloudServerPartner.description = description;

            data = {
                url,
                name,
                password,
                node_select,
                description,
                api_key: key,
                id: cloudServerPartner.id,
                key: cloudServerPartner._id,
                status: cloudServerPartner.status,
                created_at: cloudServerPartner.created_at,
                updated_at: cloudServerPartner.updated_at,
            };

            message = `Cập nhật đối tác #${cloudServerPartner.id} thành công`;
        }

        cloudServerPartner.updated_at = Date.now();
        await cloudServerPartner.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/partner/update.log', 'controlAuthUpdateCloudServerPartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateCloudServerPartner };
