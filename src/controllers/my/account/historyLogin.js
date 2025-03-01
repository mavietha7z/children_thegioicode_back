import { configCreateLog } from '~/configs';
import { LoginHistory } from '~/models/loginHistory';

const controlUserGetHistoryLogin = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await LoginHistory.countDocuments({ user_id: req.user.id });
        const pages = Math.ceil(count / pageSize);

        const results = await LoginHistory.find({ user_id: req.user.id })
            .select('ip device created_at')
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => ({
            ip: result.ip,
            device: `${result.device.os.name} ${result.device.os.version}`,
            browser: `${result.device.client.name} ${result.device.client.version}`,
            created_at: result.created_at,
        }));

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/account/historyLogin.log', 'controlUserGetHistoryLogin', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetHistoryLogin };
