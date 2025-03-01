import { Cycles } from '~/models/cycles';
import { configCreateLog } from '~/configs';

const controlAuthUpdateCycles = async (req, res) => {
    try {
        const { type, id } = req.query;

        const cycles = await Cycles.findById(id);
        if (!cycles) {
            return res.status(404).json({
                error: 'Chu kỳ cần cập nhật không tồn tại',
            });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            cycles.status = !cycles.status;

            data = true;
            message = 'Bật/Tắt trạng thái chu kỳ thành công';
        }
        if (type === 'info') {
            const { value, unit, display_name } = req.body;

            const isCycles = await Cycles.findOne({ value, unit });
            if (isCycles && isCycles._id.toString() !== id) {
                return res.status(400).json({
                    error: 'Giá trị và đơn vị chu kỳ đã tồn tại',
                });
            }

            cycles.unit = unit;
            cycles.value = value;
            cycles.display_name = display_name;

            data = {
                unit,
                value,
                display_name,
                id: cycles.id,
                key: cycles._id,
                status: cycles.status,
                created_at: cycles.created_at,
                updated_at: cycles.updated_at,
            };
            message = `Cập nhật thông tin chu kỳ #${cycles.id} thành công`;
        }

        cycles.updated_at = Date.now();
        await cycles.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cycles/update.log', 'controlAuthUpdateCycles', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateCycles };
