import { Cycles } from '~/models/cycles';
import { configCreateLog } from '~/configs';

const controlAuthGetCyclesInitialize = async (req, res) => {
    try {
        const cycles = await Cycles.find({}).select('display_name').sort({ value: 1 });
        const data = cycles.map((cycle) => {
            return {
                id: cycle._id,
                title: cycle.display_name,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cycles/initialize.log', 'controlAuthGetCyclesInitialize', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCyclesInitialize };
