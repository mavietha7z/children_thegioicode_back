import { User } from '~/models/user';
import { configCreateLog } from '~/configs';

const controlAuthSearchHistoryLoginUser = async (req, res) => {
    try {
        const { page, keyword } = req.query;

        const pageSize = 20;
        const startIndex = (Number(page) - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const regex = new RegExp(`^.*${keyword}.*(?=@)`, 'i');
        const histories = await User.find({
            email: { $regex: regex },
            history_login: { $exists: true, $ne: [] },
        }).select('full_name email role history_login');

        const result = [];
        let key = 0;
        histories.forEach((history) => {
            history.history_login.forEach((login) => {
                const newItem = {
                    key: key++,
                    info: {
                        full_name: history.full_name,
                        email: history.email,
                    },
                    role: history.role.map((role) => role),
                    ip: login.ip,
                    address: login.address,
                    user_agent: login.user_agent,
                    created_at: login.created_at,
                };
                result.push(newItem);
            });
        });
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Phân trang
        let data = [];
        for (let i = startIndex; i < endIndex && i < result.length; i++) {
            data.push(result[i]);
        }
        const pages = Math.ceil(result.length / pageSize);

        res.status(200).json({
            status: 200,
            data,
            pages,
        });
    } catch (error) {
        configCreateLog('controllers/manage/user/searchHistory.log', 'controlAuthSearchHistoryLoginUser', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthSearchHistoryLoginUser };
