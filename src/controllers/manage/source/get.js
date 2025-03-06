import { Source } from '~/models/source';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { serviceAuthGetSources } from '~/services/manage/source/get';

const controlAuthGetSources = async (req, res) => {
    try {
        const { id } = req.query;

        let objectSearch = {};
        if (isValidMongoId(id)) {
            objectSearch._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Source.countDocuments(objectSearch);
        const pages = Math.ceil(count / pageSize);

        const sources = await Source.find(objectSearch)
            .populate({ path: 'user_id', select: 'id full_name email' })
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const data = await serviceAuthGetSources(sources);

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/source/get.log', 'controlAuthGetSources', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetSources };
