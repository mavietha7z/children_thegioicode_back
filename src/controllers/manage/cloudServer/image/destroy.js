import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';

const controlAuthDestroyCloudServerImage = async (req, res) => {
    try {
        const { id } = req.query;

        const image = await CloudServerImage.findByIdAndDelete(id);
        if (!image) {
            return res.status(404).json({
                error: 'Hệ điều hành cần xoá không tồn tại',
            });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá hệ điều hành #${image.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/image/destroy.log', 'controlAuthDestroyCloudServerImage', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyCloudServerImage };
