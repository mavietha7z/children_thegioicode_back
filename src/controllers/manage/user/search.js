import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceAuthGetUsers } from '~/services/manage/user/get';

const controlAuthSearchUserByEmail = async (req, res) => {
    try {
        const { type, keyword } = req.query;

        if (type && type === 'service') {
            const users = await User.find({ email: { $regex: keyword, $options: 'i' } });

            const data = users.map((user) => {
                return {
                    id: user._id,
                    title: user.email,
                };
            });

            return res.status(200).json({
                data,
                status: 200,
            });
        }

        const regex = new RegExp(keyword, 'i');
        const users = await User.find({ email: { $regex: regex } })
            .populate({ path: 'membership.current', select: 'name' })
            .populate({ path: 'membership.next_membership', select: 'name' });

        const data = await serviceAuthGetUsers(users);

        res.status(200).json({
            status: 200,
            data,
        });
    } catch (error) {
        configCreateLog('controllers/manage/user/search.log', 'controlAuthSearchUserByEmail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthSearchUserByEmail };
