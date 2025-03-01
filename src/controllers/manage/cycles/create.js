import { Cycles } from '~/models/cycles';
import { configCreateLog } from '~/configs';

const controlAuthCreateCycles = async (req, res) => {
    try {
        const { value, unit, display_name } = req.body;

        const newCycles = await new Cycles({ value, unit, display_name }).save();

        const data = {
            unit,
            value,
            display_name,
            id: newCycles.id,
            key: newCycles._id,
            status: newCycles.status,
            created_at: newCycles.created_at,
            updated_at: newCycles.updated_at,
        };

        res.status(200).json({
            data,
            status: 200,
            message: `Tạo mới chu kỳ #${newCycles.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cycles/create.log', 'controlAuthCreateCycles', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreateCycles };
