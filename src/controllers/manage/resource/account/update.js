import { configCreateLog } from '~/configs';
import { ResourceAccount } from '~/models/resourceAccount';

const controlAuthUpdateResourceAccount = async (req, res) => {
    try {
        const { id, type } = req.query;

        const account = await ResourceAccount.findById(id)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'product_id', select: 'id title' });
        if (!account) {
            return res.status(404).json({ error: 'Tài khoản cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            account.status = !account.status;

            data = true;
            message = 'Bật/Tắt trạng thái tài khoản thành công';
        }

        if (type === 'info') {
            const { username, password, description } = req.body;

            account.username = username;
            account.password = password;
            account.description = description;

            message = `Cập nhật tài khoản #${account.id} thành công`;
            data = {
                key: id,
                username,
                password,
                description,
                id: account.id,
                user: account.user_id,
                status: account.status,
                updated_at: Date.now(),
                product: account.product_id,
                created_at: account.created_at,
            };
        }

        account.updated_at = Date.now();
        await account.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/account/update.log', 'controlAuthUpdateResourceAccount', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateResourceAccount };
