import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { Membership } from '~/models/membership';

const controlAuthGetMemberships = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Membership.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const results = await Membership.find(objectQuery).skip(skip).limit(pageSize).sort({ achieve_point: 1 });

        const data = results.map((result) => {
            const { _id: key, id, name, achieve_point, discount, status, description, created_at, updated_at } = result;

            return {
                id,
                key,
                name,
                status,
                discount,
                created_at,
                updated_at,
                description,
                achieve_point,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/membership/get.log', 'controlAuthGetMemberships', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetMemberships };
