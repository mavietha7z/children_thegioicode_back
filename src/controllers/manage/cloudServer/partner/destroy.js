import { configCreateLog } from '~/configs';
import { CloudServerPartner } from '~/models/cloudServerPartner';

const controlAuthDestroyCloudServerPartner = async (req, res) => {
    try {
        const { id } = req.query;

        const partner = await CloudServerPartner.findByIdAndDelete(id);
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
        configCreateLog('controllers/manage/cloudServer/partner/destroy.log', 'controlAuthDestroyCloudServerPartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCloudServerPartner };
