import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { OrderCloudServer } from '~/models/orderCloudServer';
import { CloudServerPartner } from '~/models/partner';
import { serviceAuthActionVPSById, serviceAuthManageVPS } from '~/services/partner/cloudServer';

const controlAuthChangePasswordCloudServerOrder = async (req, res) => {
    try {
        const { id, password, confirm_password } = req.body;

        if (!isValidMongoId(id)) {
            return res.status(400).json({ error: 'ID đơn máy chủ không hợp lệ' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Mật khẩu không được để trống' });
        }
        if (!confirm_password) {
            return res.status(400).json({ error: 'Mật khẩu xác nhận không được để trống' });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ error: 'Mật khẩu xác nhận không trùng khớp' });
        }

        const order = await OrderCloudServer.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Đơn máy chủ cần đổi mật khẩu root không tồn tại' });
        }

        const partner = await CloudServerPartner.findOne({}).select('url key password');
        if (!partner) {
            return res.status(500).json({ error: 'Máy chủ đang bảo trì hoặc không hoạt động' });
        }

        const data = {
            editvps: 1,
            rootpass: password,
        };

        // Đổi mật khẩu
        serviceAuthManageVPS(partner.url, partner.key, partner.password, order.order_info.order_id, data);

        // Khởi động lại để có hiệu lực
        serviceAuthActionVPSById(partner.url, partner.key, partner.password, 'restart', order.order_info.order_id);

        res.status(200).json({
            status: 200,
            message: `Gửi yêu cầu đến máy chủ #${order.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/order/password.log', 'controlAuthChangePasswordCloudServerOrder', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthChangePasswordCloudServerOrder };
