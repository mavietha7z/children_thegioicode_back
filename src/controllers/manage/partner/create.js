import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';

const controlAuthCreatePartner = async (req, res) => {
    try {
        const { name, url, token } = req.body;

        const isPartner = await Partner.findOne({});
        if (isPartner) {
            return res.status(400).json({ error: 'Đã có một đối tác tồn tại' });
        }

        const newPartner = await new Partner({
            url,
            name,
            token,
        }).save();

        const data = {
            url,
            name,
            token,
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
        configCreateLog('controllers/manage/partner/create.log', 'controlAuthCreatePartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreatePartner };
