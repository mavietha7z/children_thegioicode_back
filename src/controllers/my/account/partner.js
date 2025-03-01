import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import { User } from '~/models/user';
import { Partner } from '~/models/partner';
import { configCreateLog } from '~/configs';
import { PartnerService } from '~/models/partnerService';
import { serviceUserVerifyToken } from '~/services/user/token';

const generateLongToken = () => {
    const randomData = Date.now().toString() + Math.random().toString();

    let token = CryptoJS.SHA512(randomData).toString(CryptoJS.enc.Base64);

    token = 'Tgc' + token.replace(/[^a-zA-Z0-9]/g, '');

    return token;
};

const createUniqueToken = async () => {
    let token;
    let isUnique = false;

    while (!isUnique) {
        token = generateLongToken();

        const isToken = await Partner.findOne({ token });

        if (!isToken) {
            isUnique = true;
        }
    }

    return token;
};

const controlUserCreatePartner = async (req, res) => {
    try {
        const { register_type } = req.user;
        const { password, two_factor_auth_type } = req.body;

        const user = await User.findById(req.user.id).select('password');

        if (register_type === 'email') {
            if (!password || password.length < 6 || password.length > 30) {
                return res.status(400).json({ error: 'Mật khẩu của bạn không hợp lệ' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Mật khẩu của bạn không chính xác' });
            }
        }

        if (two_factor_auth_type === 'Email' && register_type !== 'email') {
            const token = await serviceUserVerifyToken(password, 'verify', true);

            if (!token) {
                return res.status(400).json({ error: 'Mã xác thực không đúng hoặc đã hết hạn' });
            }
        }

        const token = await createUniqueToken();

        const isPartner = await Partner.findOne({ user_id: req.user.id });
        if (isPartner) {
            isPartner.token = token;
            await isPartner.save();
        } else {
            const newPartner = await new Partner({
                user_id: req.user.id,
                token,
            }).save();

            const services = [
                {
                    user_id: req.user.id,
                    partner_id: newPartner._id,
                    category: 'CloudServer',
                    service_register: 0,
                    discount_type: ['api'],
                    discount_rules: [{ service: 0, discount: 0 }],
                    status: true,
                },
                {
                    user_id: req.user.id,
                    partner_id: newPartner._id,
                    category: 'Api',
                    service_register: 0,
                    discount_type: ['api'],
                    discount_rules: [{ service: 0, discount: 0 }],
                    status: true,
                },
            ];

            for (const service of services) {
                await new PartnerService({
                    user_id: service.user_id,
                    partner_id: service.partner_id,
                    category: service.category,
                    service_register: service.service_register,
                    discount_type: service.discount_type,
                    discount_rules: service.discount_rules,
                    status: service.status,
                }).save();
            }
        }

        res.status(200).json({
            data: token,
            status: 200,
            message: 'Tạo token thành công! Token chỉ hiển thị một lần duy nhất tại đây, vui lòng sao chép lưu trữ cẩn trọng!',
        });
    } catch (error) {
        configCreateLog('controllers/my/account/partner.log', 'controlUserCreatePartner', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserCreatePartner };
