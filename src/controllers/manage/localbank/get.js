import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { Localbank } from '~/models/localbank';

const controlAuthGetLocalbanks = async (req, res) => {
    try {
        const { id } = req.query;

        let objectSearch = {};
        if (isValidMongoId(id)) {
            objectSearch._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Localbank.countDocuments(objectSearch);
        const pages = Math.ceil(count / pageSize);

        const results = await Localbank.find(objectSearch).skip(skip).limit(pageSize).sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                code,
                type,
                status,
                _id: key,
                sub_name,
                logo_url,
                full_name,
                created_at,
                updated_at,
                description,
                interbank_code,
            } = result;

            return {
                id,
                key,
                type,
                code,
                status,
                sub_name,
                logo_url,
                full_name,
                created_at,
                updated_at,
                description,
                interbank_code,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/localbank/get.log', 'controlAuthGetLocalbanks', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetLocalbanks };
