import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';
import { isValidMongoId } from '~/validators';
import { PartnerService } from '~/models/partnerService';

const controlAuthGetPartners = async (req, res) => {
    try {
        const { id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Partner.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const results = await Partner.find(objectQuery)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const { id, _id: key, user_id: user, whitelist_ip, status, created_at, updated_at } = result;

            return {
                id,
                key,
                user,
                status,
                created_at,
                updated_at,
                whitelist_ip,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/partner/get.log', 'controlAuthGetPartners', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthGetServices = async (req, res) => {
    try {
        const { partner_id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(partner_id)) {
            objectQuery.partner_id = partner_id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await PartnerService.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const results = await PartnerService.find(objectQuery)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'partner_id', select: 'id' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                status,
                _id: key,
                category,
                created_at,
                updated_at,
                user_id: user,
                discount_type,
                discount_rules,
                service_register,
                partner_id: partner,
            } = result;

            return {
                id,
                key,
                user,
                status,
                partner,
                category,
                created_at,
                updated_at,
                discount_type,
                discount_rules,
                service_register,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/partner/get.log', 'controlAuthGetServices', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetPartners, controlAuthGetServices };
