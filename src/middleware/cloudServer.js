import jwt from 'jsonwebtoken';
import { Partner } from '~/models/partner';
import { configGetDiscountRulePartner } from '~/configs';
import { PartnerService } from '~/models/partnerService';

const middlewareUserVerifyTokenPartner = (category) => {
    return async (req, res, next) => {
        const { session_key } = req.cookies;

        if (!session_key) {
            return next();
        }

        try {
            // Xác thực token
            const user = await new Promise((resolve, reject) => {
                jwt.verify(session_key, 'jwt-session_key-user', (error, decodedUser) => {
                    if (error) {
                        return next();
                    }

                    resolve(decodedUser);
                });
            });

            if (!category || category !== 'CloudServer') {
                return res.status(403).json({
                    error: 'Bạn không có quyền truy cập dịch vụ này',
                });
            }

            const partner = await Partner.findOne({ user_id: user.id });

            req.user = user;
            req.partner = partner;

            if (partner) {
                const service = await PartnerService.findOne({ user_id: user.id, category, discount_type: 'app' });
                if (service) {
                    const discount = configGetDiscountRulePartner(service.service_register, service.discount_rules);

                    req.service = service;
                    req.discount = discount;
                }
            }

            next();
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi xác minh quyền truy cập vui lòng thử lại' });
        }
    };
};

const serviceUserVerifyTokenPartner = async (category, user_id) => {
    if (!category || category !== 'CloudServer') {
        return {
            success: false,
            status: 400,
            error: 'Bạn không có quyền truy cập dịch vụ này',
        };
    }

    let result = {
        success: true,
        status: 200,
        data: {},
    };

    const partner = await Partner.findOne({ user_id });

    result.data.partner = partner;

    if (partner) {
        const service = await PartnerService.findOne({ user_id, category, discount_type: 'app' });
        if (service) {
            const discount = configGetDiscountRulePartner(service.service_register, service.discount_rules);

            result.data.service = service;
            result.data.discount = discount;
        }
    }

    return result;
};
export { middlewareUserVerifyTokenPartner, serviceUserVerifyTokenPartner };
