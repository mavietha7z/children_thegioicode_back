import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerImage } from '~/models/cloudServerImage';

const controlUserBillingRebuildInstance = async (req, res) => {
    try {
        const { instance_id, image_id } = req.body;

        if (!isValidDataId(instance_id) || !isValidDataId(image_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const instance = await OrderCloudServer.findOne({
            user_id: req.user.id,
            id: instance_id,
            status: { $nin: ['deleted', 'expired'] },
        });
        if (!instance) {
            return res.status(404).json({
                error: `Máy chủ #${instance_id} không tồn tại`,
            });
        }

        const image = await CloudServerImage.findOne({ id: image_id, status: true });
        if (!image) {
            return res.status(404).json({
                error: `Hệ điều hành #${image_id} không tồn tại`,
            });
        }

        const data = {
            reos: 1,
            osid: image.code,
            conf: instance.order_info.password,
            vpsid: instance.order_info.order_id,
            newpass: instance.order_info.password,
        };

        // serviceAuthRebuildVPS(partner.url, partner.key, partner.password, data);

        instance.status = 'rebuilding';
        instance.image_id = image._id;
        instance.updated_at = Date.now();
        await instance.save();

        res.status(200).json({
            data: true,
            status: 200,
            message: 'Đã gửi lệnh thực hiện thao tác thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/instance/rebuild.log', 'controlUserBillingRebuildInstance', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserBillingRebuildInstance };
