import { configCreateLog } from '~/configs';
import { Userbank } from '~/models/userbank';

const controlAuthCreateUserbank = async (req, res) => {
    try {
        const { user_id, localbank_id, account_number, account_holder, account_password, branch } = req.body;

        const newUserbank = await new Userbank({
            branch,
            user_id,
            localbank_id,
            account_number,
            account_holder,
            account_password,
        }).save();

        const data = {
            branch,
            account_number,
            account_holder,
            user: req.userbank,
            id: newUserbank.id,
            key: newUserbank._id,
            localbank: req.localbank,
            status: newUserbank.status,
            created_at: newUserbank.created_at,
            updated_at: newUserbank.updated_at,
            description: newUserbank.description,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới ngân hàng cho khách hàng thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/userbank/create.log', 'controlAuthCreateUserbank', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateUserbank };
