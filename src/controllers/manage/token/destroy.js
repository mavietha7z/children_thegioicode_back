import { Token } from '~/models/token';
import { configCreateLog } from '~/configs';

const controlAuthDestroyTokenUser = async (req, res) => {
    try {
        const { id } = req.query;

        const token = await Token.findByIdAndDelete(id);
        if (!token) {
            return res.status(404).json({
                error: 'Không tìm thấy mã xác minh cần xoá',
            });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá mã xác minh #${token.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/token/destroy.log', 'controlAuthDestroyTokenUser', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyTokenUser };
