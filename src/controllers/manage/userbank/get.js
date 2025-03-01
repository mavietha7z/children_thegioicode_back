import { User } from '~/models/user';
import { configCreateLog } from '~/configs';
import { Userbank } from '~/models/userbank';
import { Localbank } from '~/models/localbank';

const controlAuthGetUserbanks = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Userbank.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const results = await Userbank.find({})
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'localbank_id', select: 'id full_name sub_name' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                status,
                branch,
                _id: key,
                created_at,
                updated_at,
                description,
                user_id: user,
                account_holder,
                account_number,
                localbank_id: localbank,
            } = result;

            return {
                id,
                key,
                user,
                status,
                branch,
                localbank,
                created_at,
                updated_at,
                description,
                account_number,
                account_holder,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/userbank/get.log', 'controlAuthGetUserbanks', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthSearchUserbank = async (req, res) => {
    try {
        const { type, keyword } = req.query;

        if (!['user', 'localbank'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        let data = [];
        if (type === 'user') {
            const regex = new RegExp(keyword, 'i');
            const users = await User.find({ email: { $regex: regex } }).select('email');

            data = users.map((user) => {
                return {
                    id: user._id,
                    title: user.email,
                };
            });
        }

        if (type === 'localbank') {
            const localBanks = await Localbank.find({
                $or: [{ full_name: { $regex: keyword, $options: 'i' } }, { sub_name: { $regex: keyword, $options: 'i' } }],
            });

            data = localBanks.map((localbank) => {
                return {
                    id: localbank._id,
                    title: localbank.full_name,
                };
            });
        }

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/userbank/get.log', 'controlAuthSearchUserbank', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetUserbanks, controlAuthSearchUserbank };
