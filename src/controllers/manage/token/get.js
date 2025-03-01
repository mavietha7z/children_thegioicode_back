import { Token } from '~/models/token';
import { configCreateLog } from '~/configs';

const controlAuthGetTokenUsers = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Token.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const results = await Token.find({})
            .populate({ path: 'user_id', select: 'id email full_name' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                otp,
                token,
                modun,
                encrypt,
                service,
                _id: key,
                expired_at,
                created_at,
                updated_at,
                description,
                user_id: user,
            } = result;

            return {
                id,
                key,
                otp,
                user,
                modun,
                token,
                encrypt,
                service,
                created_at,
                updated_at,
                expired_at,
                description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/token/get.log', 'controlAuthGetTokenUsers', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetTokenUsers };
