import { configCreateLog } from '~/configs';
import { Localbank } from '~/models/localbank';

const controlAuthCreateLocalbank = async (req, res) => {
    try {
        const { full_name, sub_name, code, type, interbank_code, logo_url } = req.body;

        const newLocalbank = await new Localbank({
            code,
            logo_url,
            sub_name,
            full_name,
            type,
            interbank_code,
        }).save();

        const data = {
            code,
            type,
            sub_name,
            logo_url,
            full_name,
            interbank_code,
            id: newLocalbank.id,
            key: newLocalbank._id,
            status: newLocalbank.status,
            created_at: newLocalbank.created_at,
            updated_at: newLocalbank.updated_at,
            description: newLocalbank.description,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới ngân hàng #${newLocalbank.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/localbank/create.log', 'controlAuthCreateLocalbank', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateLocalbank };
