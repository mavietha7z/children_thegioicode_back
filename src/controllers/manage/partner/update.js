import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';
import { PartnerService } from '~/models/partnerService';

const controlAuthUpdatePartner = async (req, res) => {
    try {
        const { id, type } = req.query;

        const partner = await Partner.findById(id).populate({ path: 'user_id', select: 'id email full_name' });
        if (!partner) {
            return res.status(404).json({ error: 'Đối tác cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            partner.status = !partner.status;

            data = true;
            message = 'Bật/Tắt trạng thái đối tác thành công';
        }

        if (type === 'info') {
            const { whitelist_ip } = req.body;

            partner.whitelist_ip = whitelist_ip;

            message = `Cập nhật đối tác #${partner.id} thành công`;
            data = {
                key: id,
                whitelist_ip,
                id: partner.id,
                user: partner.user_id,
                updated_at: Date.now(),
                status: partner.status,
                created_at: partner.created_at,
            };
        }

        partner.updated_at = Date.now();
        await partner.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/partner/update.log', 'controlAuthUpdatePartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthUpdateService = async (req, res) => {
    try {
        const { id, type } = req.query;

        const service = await PartnerService.findById(id)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'partner_id', select: 'id' });
        if (!service) {
            return res.status(404).json({ error: 'Dịch vụ cần cập nhật không tồn tại' });
        }

        let data = null;
        let message = '';
        if (type === 'status') {
            service.status = !service.status;

            data = true;
            message = 'Bật/Tắt trạng thái dịch vụ thành công';
        }

        if (type === 'info') {
            const { discount_rules, discount_type } = req.body;

            let isRule = true;
            for (let i = 0; i < discount_rules.length; i++) {
                const discountRule = discount_rules[i];

                if (typeof discountRule.service !== 'number' || typeof discountRule.discount !== 'number') {
                    isRule = false;
                    break;
                }
                if (discountRule.service < 0 || discountRule.discount < 0 || discountRule.discount > 100) {
                    isRule = false;
                    break;
                }
            }
            if (!isRule) {
                return res.status(400).json({ error: 'Các điều kiện giảm giá phải là số và từ từ 0 đến 100' });
            }

            service.discount_type = discount_type;
            service.discount_rules = discount_rules;

            message = `Cập nhật dịch vụ #${service.id} thành công`;
            data = {
                key: id,
                discount_type,
                discount_rules,
                id: service.id,
                user: service.user_id,
                updated_at: Date.now(),
                status: service.status,
                partner: service.partner_id,
                category: service.category,
                created_at: service.created_at,
                service_register: service.service_register,
            };
        }

        service.updated_at = Date.now();
        await service.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/partner/update.log', 'controlAuthUpdateService', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdatePartner, controlAuthUpdateService };
