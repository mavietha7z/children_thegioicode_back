import { configCreateLog } from '~/configs';
import { Membership } from '~/models/membership';

const controlAuthUpdateMembership = async (req, res) => {
    try {
        const { id, type } = req.query;

        if (!['info', 'status'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const membership = await Membership.findById(id);
        if (!membership) {
            return res.status(404).json({ error: 'Không tìm thấy bậc thành viên' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            membership.status = !membership.status;

            data = true;
            message = 'Bật/Tắt trạng thái bậc thành viên thành công';
        }

        if (type === 'info') {
            const { achieve_point, discount, description } = req.body;

            if (typeof discount !== 'number' || discount < 0 || discount > 100) {
                return res.status(400).json({
                    error: 'Giảm giá chỉ được từ 1% đến 100%',
                });
            }

            if (typeof achieve_point !== 'number' || achieve_point < 0) {
                return res.status(400).json({
                    error: 'Điểm thành tích luỹ phải lớn hơn hoặc bằng 0',
                });
            }

            membership.discount = discount;
            membership.description = description;
            membership.achieve_point = achieve_point;

            data = {
                key: id,
                discount,
                description,
                achieve_point,
                id: membership.id,
                name: membership.name,
                updated_at: Date.now(),
                status: membership.status,
                created_at: membership.created_at,
            };
            message = `Cập nhật bậc #${membership.id} thành công`;
        }

        await membership.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/membership/update.log', 'controlAuthUpdateMembership', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateMembership };
