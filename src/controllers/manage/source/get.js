import { Source } from '~/models/source';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { OrderSource } from '~/models/orderSource';
import { serviceAuthGetSources } from '~/services/manage/source/get';

const controlAuthGetSources = async (req, res) => {
    try {
        const { id } = req.query;

        let objectSearch = {};
        if (isValidMongoId(id)) {
            objectSearch._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Source.countDocuments(objectSearch);
        const pages = Math.ceil(count / pageSize);

        const sources = await Source.find(objectSearch)
            .populate({ path: 'user_id', select: 'id full_name email' })
            .skip(skip)
            .limit(pageSize)
            .sort({ priority: 1 });

        const data = await serviceAuthGetSources(sources);

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/source/get.log', 'controlAuthGetSources', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthGetOrdersSources = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await OrderSource.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const orders = await OrderSource.find({})
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'source_id', select: 'id title' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = orders.map((order) => {
            const {
                id,
                status,
                cycles,
                _id: key,
                quantity,
                discount,
                data_url,
                invoice_id,
                created_at,
                updated_at,
                unit_price,
                bonus_point,
                total_price,
                description,
                user_id: user,
                source_id: source,
            } = order;

            return {
                id,
                key,
                user,
                status,
                source,
                cycles,
                quantity,
                discount,
                data_url,
                invoice_id,
                created_at,
                updated_at,
                unit_price,
                bonus_point,
                total_price,
                description,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/source/get.log', 'controlAuthGetOrdersSources', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetSources, controlAuthGetOrdersSources };
