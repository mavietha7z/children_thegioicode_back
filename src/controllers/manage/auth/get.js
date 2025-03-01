import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { serviceGetCurrentUser } from '~/services/user/currentUser';

const controlAuthGetCurrent = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'membership.current',
                select: 'name description',
            })
            .populate({
                path: 'membership.next_membership',
                select: 'name achieve_point description',
            });

        const data = await serviceGetCurrentUser(user);

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/auth/get.log', 'controlAuthGetCurrent', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetCurrent };
