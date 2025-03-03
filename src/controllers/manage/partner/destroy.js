import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';

const controlAuthDestroyPartner = async (req, res) => {
    try {
        const { id } = req.query;

        const partner = await Partner.findByIdAndDelete(id);
        if (!partner) {
            return res.status(404).json({
                error: 'Đối tác cần xoá không tồn tại',
            });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá đối tác #${partner.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/partner/destroy.log', 'controlAuthDestroyPartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyPartner };
