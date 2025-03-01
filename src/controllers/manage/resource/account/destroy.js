import { configCreateLog } from '~/configs';
import { ResourceAccount } from '~/models/resourceAccount';

const controlAuthDestroyResourceAccount = async (req, res) => {
    try {
        const { id } = req.query;

        const account = await ResourceAccount.findByIdAndDelete(id);
        if (!account) {
            return res.status(404).json({ error: 'Tài khoản cần xoá không tồn tại' });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá tài khoản #${account.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/account/destroy.log', 'controlAuthDestroyResourceAccount', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyResourceAccount };
