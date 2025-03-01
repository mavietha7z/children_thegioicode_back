import { configCreateLog } from '~/configs';
import { Localbank } from '~/models/localbank';

const controlAuthUpdateLocalbank = async (req, res) => {
    try {
        const { id, type } = req.query;

        const localbank = await Localbank.findById(id);
        if (!localbank) {
            return res.status(404).json({ error: 'Ngân hàng cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            localbank.status = !localbank.status;

            data = true;
            message = 'Bật/Tắt trạng thái ngân hàng thành công';
        }

        if (type === 'info') {
            const { full_name, sub_name, code, type, interbank_code, logo_url } = req.body;

            localbank.code = code;
            localbank.type = type;
            localbank.sub_name = sub_name;
            localbank.logo_url = logo_url;
            localbank.full_name = full_name;
            localbank.interbank_code = interbank_code;

            data = {
                code,
                type,
                key: id,
                sub_name,
                logo_url,
                full_name,
                interbank_code,
                id: localbank.id,
                updated_at: Date.now(),
                status: localbank.status,
                created_at: localbank.created_at,
                description: localbank.description,
            };

            message = `Cập nhật ngân hàng #${localbank.id} thành công`;
        }

        localbank.updated_at = Date.now();
        await localbank.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/localbank/update.log', 'controlAuthUpdateLocalbank', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateLocalbank };
