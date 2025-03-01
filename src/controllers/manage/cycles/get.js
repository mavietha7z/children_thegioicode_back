import { Cycles } from '~/models/cycles';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';

const controlAuthGetCycles = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Cycles.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const results = await Cycles.find(objectQuery).skip(skip).limit(pageSize).sort({ unit: 1 });

        const data = results.map((result) => {
            const { id, value, unit, display_name, status, _id: key, created_at, updated_at } = result;

            return {
                id,
                key,
                unit,
                value,
                status,
                created_at,
                updated_at,
                display_name,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cycles/get.log', 'controlAuthGetCycles', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCycles };
