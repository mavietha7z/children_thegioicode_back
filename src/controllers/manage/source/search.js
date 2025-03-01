import { Source } from '~/models/source';
import { configCreateLog } from '~/configs';
import { serviceAuthGetSources } from '~/services/manage/source/get';

const controlAuthSearchSource = async (req, res) => {
    try {
        const { id } = req.query;

        const sources = await Source.find({ id }).populate({ path: 'user_id', select: 'id full_name email' });

        const data = await serviceAuthGetSources(sources);

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/source/search.log', 'controlAuthSearchSource', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthSearchSource };
