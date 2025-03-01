import { configCreateLog } from '~/configs';
import { Template } from '~/models/template';

const controlAuthSearchOrderTemplate = async (req, res) => {
    try {
        const { keyword } = req.query;

        const templates = await Template.find({ title: { $regex: keyword, $options: 'i' } });

        const data = templates.map((template) => {
            return {
                id: template._id,
                title: template.title,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/template/search.log', 'controlAuthSearchOrderTemplate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthSearchOrderTemplate };
