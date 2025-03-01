import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';
import { serviceAuthGetApikeys } from '~/services/manage/apikey/get';

const controlAuthGetApiKeys = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Apikey.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const apikeys = await Apikey.find({})
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'service_id', select: 'id title' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = serviceAuthGetApikeys(apikeys);

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/apikey/get.log', 'controlAuthGetApiKeys', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetApiKeys };
