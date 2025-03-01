import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { CloudServerRegion } from '~/models/cloudServerRegion';

const controlAuthGetCloudServerRegions = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await CloudServerRegion.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const regions = await CloudServerRegion.find(objectQuery)
            .populate({ path: 'plans', select: 'id title image_url' })
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const data = regions.map((partner) => {
            const { id, _id: key, title, priority, image_url, plans, status, description, created_at, updated_at } = partner;

            return {
                id,
                key,
                title,
                plans,
                status,
                priority,
                image_url,
                created_at,
                updated_at,
                description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/cloudServer/region/get.log', 'controlAuthGetCloudServerRegion', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCloudServerRegions };
