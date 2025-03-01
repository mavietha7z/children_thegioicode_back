import { configCreateLog } from '~/configs';
import { WalletHistory } from '~/models/walletHistory';

const controlAuthDestroyWalletHistory = async (req, res) => {
    try {
        const { id } = req.query;

        const walletHistory = await WalletHistory.findByIdAndDelete(id);
        if (!walletHistory) {
            return res.status(404).json({ error: 'Biến động số dư cần xoá không tồn tại' });
        }

        res.status(200).json({
            status: 200,
            message: `Xóa biến động số dư #${walletHistory.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/wallet/destroy.log', 'controlAuthDestroyWalletHistory', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyWalletHistory };
