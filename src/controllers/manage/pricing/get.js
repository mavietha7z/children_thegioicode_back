import { Cycles } from '~/models/cycles';
import { Source } from '~/models/source';
import { Pricing } from '~/models/pricing';
import { Template } from '~/models/template';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';

const controlAuthGetPricings = async (req, res) => {
    try {
        const { id, service_id } = req.query;

        let objectSearch = {};
        if (isValidMongoId(id)) {
            objectSearch._id = id;
        }
        if (isValidMongoId(service_id)) {
            objectSearch.service_id = service_id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Pricing.countDocuments(objectSearch);
        const pages = Math.ceil(count / pageSize);

        const results = await Pricing.find(objectSearch)
            .populate({ path: 'service_id', select: 'id title' })
            .populate({ path: 'cycles_id', select: 'display_name' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                price,
                status,
                _id: key,
                discount,
                created_at,
                updated_at,
                other_fees,
                bonus_point,
                penalty_fee,
                renewal_fee,
                upgrade_fee,
                creation_fee,
                service_type,
                brokerage_fee,
                cancellation_fee,
                cycles_id: cycles,
                service_id: service,
            } = result;

            return {
                id,
                key,
                price,
                cycles,
                status,
                service,
                discount,
                created_at,
                updated_at,
                other_fees,
                bonus_point,
                renewal_fee,
                upgrade_fee,
                penalty_fee,
                service_type,
                creation_fee,
                brokerage_fee,
                cancellation_fee,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/pricing/get.log', 'controlAuthGetPricings', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthSearchPricing = async (req, res) => {
    try {
        const { type, keyword } = req.query;

        if (!['service', 'cycles'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        let data = [];
        if (type === 'service') {
            const [templates, sources] = await Promise.all([
                Template.find({
                    title: { $regex: keyword, $options: 'i' },
                }),
                Source.find({
                    title: { $regex: keyword, $options: 'i' },
                }),
            ]);

            const combinedResults = [...templates, ...sources];

            data = combinedResults.map((result) => {
                return {
                    id: result._id,
                    title: result.title,
                };
            });
        }

        if (type === 'cycles') {
            const cycles = await Cycles.find({
                display_name: { $regex: keyword, $options: 'i' },
            });

            data = cycles.map((cycle) => {
                return {
                    id: cycle._id,
                    title: cycle.display_name,
                };
            });
        }

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/pricing/get.log', 'controlAuthSearchPricing', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetPricings, controlAuthSearchPricing };
