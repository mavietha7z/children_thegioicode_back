import { configCreateLog } from '~/configs';
import { ResourceAccount } from '~/models/resourceAccount';

const controlAuthGetResourceAccounts = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await ResourceAccount.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const accounts = await ResourceAccount.find({})
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'product_id', select: 'id title' })
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const data = accounts.map((account) => {
            const {
                id,
                status,
                _id: key,
                username,
                password,
                created_at,
                updated_at,
                description,
                user_id: user,
                product_id: product,
            } = account;

            return {
                id,
                key,
                user,
                status,
                product,
                username,
                password,
                created_at,
                updated_at,
                description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/resource/account/get.log', 'controlAuthGetResourceAccounts', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetResourceAccounts };
