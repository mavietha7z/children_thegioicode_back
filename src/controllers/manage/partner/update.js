import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';

const controlAuthUpdatePartner = async (req, res) => {
    try {
        const { id, type } = req.query;

        const partner = await Partner.findById(id);
        if (!partner) {
            return res.status(404).json({ error: 'Đối tác cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            partner.status = !partner.status;

            data = true;
            message = 'Bật/Tắt trạng thái đối tác thành công';
        }

        if (type === 'info') {
            const { name, url, token } = req.body;

            partner.url = url;
            partner.name = name;
            partner.token = token;

            data = {
                url,
                name,
                token,
                key: id,
                id: partner.id,
                status: partner.status,
                created_at: partner.created_at,
                updated_at: partner.updated_at,
            };

            message = `Cập nhật đối tác #${partner.id} thành công`;
        }

        partner.updated_at = Date.now();
        await partner.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/partner/update.log', 'controlAuthUpdatePartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdatePartner };
