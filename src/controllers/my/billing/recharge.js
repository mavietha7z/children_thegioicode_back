import { Paygate } from '~/models/paygate';
import { configCreateLog } from '~/configs';

const controlUserGetRecharge = async (req, res) => {
    try {
        const paygates = await Paygate.find({ service: 'recharge' })
            .populate({
                path: 'options.userbank_id',
                populate: [
                    { path: 'user_id', select: 'id email full_name' },
                    { path: 'localbank_id', select: 'id full_name sub_name code interbank_code type logo_url status' },
                ],
            })
            .sort({ created_at: -1 });

        const data = paygates.map((paygate) => {
            const { name, status, question, logo_url, description, options, bonus_point, minimum_payment, maximum_payment } = paygate;

            return {
                name,
                status,
                question,
                logo_url,
                description,
                bonus_point,
                minimum_payment,
                maximum_payment,
                options: options.map((option) => {
                    return {
                        status: option.status,
                        code: option.userbank_id.localbank_id.code,
                        type: option.userbank_id.localbank_id.type,
                        description: option.userbank_id.description,
                        name: option.userbank_id.localbank_id.full_name,
                        logo_url: option.userbank_id.localbank_id.logo_url,
                        sub_name: option.userbank_id.localbank_id.sub_name,
                        account_holder: option.userbank_id.account_holder,
                        account_number: option.userbank_id.account_number,
                        interbank_code: option.userbank_id.localbank_id.interbank_code,
                    };
                }),
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/recharge.log', 'controlUserGetRecharge', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetRecharge };
