import { configCreateLog } from '~/configs';
import { CloudServerPartner } from '~/models/cloudServerPartner';

const controlAuthGetCloudServerPartner = async (req, res) => {
    try {
        const partners = await CloudServerPartner.find({}).sort({ created_at: -1 });

        const data = partners.map((partner) => {
            const { id, _id: key, name, status, url, key: api_key, password, node_select, description, created_at, updated_at } = partner;

            return {
                key,
                id,
                url,
                name,
                status,
                api_key,
                password,
                created_at,
                updated_at,
                node_select,
                description,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/partner/get.log', 'controlAuthGetCloudServerPartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCloudServerPartner };
