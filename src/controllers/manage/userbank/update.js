import { configCreateLog } from '~/configs';
import { Userbank } from '~/models/userbank';

const controlAuthUpdateUserbank = async (req, res) => {
    try {
        const { id, type } = req.query;

        const userbank = await Userbank.findById(id)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'localbank_id', select: 'id full_name sub_name' });
        if (!userbank) {
            return res.status(404).json({ error: 'Ngân hàng thành viên không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            userbank.status = !userbank.status;

            data = true;
            message = 'Bật/Tắt trạng thái ngân hàng thành viên thành công';
        }

        if (type === 'info') {
            const { account_number, account_holder, account_password, branch } = req.body;

            userbank.branch = branch;
            userbank.account_number = account_number;
            userbank.account_holder = account_holder;

            if (account_password) {
                userbank.account_password = account_password;
            }

            message = `Cập nhật ngân hàng thành viên #${userbank.id} thành công`;
            data = {
                branch,
                key: id,
                account_number,
                account_holder,
                id: userbank.id,
                updated_at: Date.now(),
                user: userbank.user_id,
                status: userbank.status,
                created_at: userbank.created_at,
                localbank: userbank.localbank_id,
                description: userbank.description,
            };
        }

        userbank.updated_at = Date.now();
        await userbank.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/userbank/update.log', 'controlAuthUpdateUserbank', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateUserbank };
