import { configCreateLog } from '~/configs';
import { Charging } from '~/models/charging';

const controlAuthGetChargings = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Charging.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const chargings = await Charging.find({})
            .populate({
                path: 'user_id',
                select: 'id full_name email',
            })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = chargings.map((charging) => {
            return {
                id: charging.id,
                key: charging._id,
                fees: charging.fees,
                code: charging.code,
                telco: charging.telco,
                value: charging.value,
                user: charging.user_id,
                serial: charging.serial,
                amount: charging.amount,
                status: charging.status,
                message: charging.message,
                trans_id: charging.trans_id,
                created_at: charging.created_at,
                request_id: charging.request_id,
                updated_at: charging.updated_at,
                description: charging.description,
                approved_at: charging.approved_at,
                declared_value: charging.declared_value,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/charging/get.log', 'controlAuthGetChargings', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetChargings };
