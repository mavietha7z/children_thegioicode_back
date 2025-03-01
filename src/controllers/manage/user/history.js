import { configCreateLog } from '~/configs';
import { LoginHistory } from '~/models/loginHistory';

const controlAuthGetHistoryLoginUsers = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await LoginHistory.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const histories = await LoginHistory.find({})
            .populate({ path: 'user_id', select: 'id full_name email role' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = histories.map((history) => {
            const { _id: key, id, user_id: user, ip, address, device, created_at, updated_at } = history;

            return {
                id,
                ip,
                key,
                user,
                address,
                created_at,
                updated_at,
                role: user.role.map((role) => role),
                device: `${device.os.name} ${device.os.version}`,
                browser: `${device.client.name} ${device.client.version}`,
            };
        });

        res.status(200).json({
            status: 200,
            data,
            pages,
        });
    } catch (error) {
        configCreateLog('controllers/manage/user/history.log', 'controlAuthGetHistoryLoginUsers', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetHistoryLoginUsers };
