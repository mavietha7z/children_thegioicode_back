import { User } from '~/models/user';
import { Apikey } from '~/models/apikey';
import { configCreateLog } from '~/configs';
import { serviceAuthGetApikeys } from '~/services/manage/apikey/get';

const controlAuthSearchApikeyByEmail = async (req, res) => {
    try {
        const { keyword } = req.query;

        const users = await User.find({ email: { $regex: keyword, $options: 'i' } }).select('id email full_name');
        const userIds = users.map((user) => user._id);

        const apikeys = await Apikey.find({ user_id: { $in: userIds } })
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'service_id', select: 'id title' });

        const data = serviceAuthGetApikeys(apikeys);

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/apikey/search.log', 'controlAuthSearchApikeyByEmail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthSearchApikeyByEmail };
