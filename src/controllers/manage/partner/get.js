import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';

const controlAuthGetPartners = async (req, res) => {
    try {
        const partners = await Partner.find({}).sort({ created_at: -1 });

        const data = partners.map((partner) => {
            const {
                id,
                url,
                name,
                token,
                status,
                _id: key,
                created_at,
                updated_at,
                difference_public_api,
                difference_cloud_server,
            } = partner;

            return {
                id,
                key,
                url,
                name,
                token,
                status,
                created_at,
                updated_at,
                difference_public_api,
                difference_cloud_server,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/partner/get.log', 'controlAuthGetPartners', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetPartners };
