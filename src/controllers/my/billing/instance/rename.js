import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';

const controlUserBillingRenameInstance = async (req, res) => {
    try {
        const { instance_id, display_name } = req.body;

        if (!isValidDataId(instance_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }
        if (!display_name) {
            return res.status(400).json({
                error: 'Tên hiển thị không được để trống',
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

        instance.updated_at = Date.now();
        instance.display_name = display_name;
        await instance.save();

        res.status(200).json({
            status: 200,
            message: 'Đã đổi tên hiển thị máy chủ thành công',
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/instance/rename.log', 'controlUserBillingRenameInstance', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserBillingRenameInstance };
