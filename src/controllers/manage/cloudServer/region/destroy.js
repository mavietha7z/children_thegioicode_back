import { configCreateLog } from '~/configs';
import { CloudServerRegion } from '~/models/cloudServerRegion';

const controlAuthDestroyCloudServerRegion = async (req, res) => {
    try {
        const { id } = req.query;

        const region = await CloudServerRegion.findByIdAndDelete(id);
        if (!region) {
            return res.status(404).json({
                error: 'Khu vực cần xoá không tồn tại',
            });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá khu vực #${region.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/region/destroy.log', 'controlAuthDestroyCloudServerRegion', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCloudServerRegion };
