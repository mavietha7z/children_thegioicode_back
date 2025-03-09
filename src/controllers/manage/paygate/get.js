import { Paygate } from '~/models/paygate';
import { configCreateLog } from '~/configs';
import { Userbank } from '~/models/userbank';

const controlAuthGetPaygates = async (req, res) => {
    try {
        const paygates = await Paygate.find({}).sort({ created_at: -1 });

        const data = paygates.map((paygate) => {
            return {
                id: paygate.id,
                key: paygate._id,
                name: paygate.name,
                status: paygate.status,
                vat_tax: paygate.vat_tax,
                service: paygate.service,
                logo_url: paygate.logo_url,
                question: paygate.question,
                discount: paygate.discount,
                promotion: paygate.promotion,
                created_at: paygate.created_at,
                updated_at: paygate.updated_at,
                bonus_point: paygate.bonus_point,
                description: paygate.description,
                callback_code: paygate.callback_code,
                option_count: paygate.options.length,
                minimum_payment: paygate.minimum_payment,
                maximum_payment: paygate.maximum_payment,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/get.log', 'controlAuthGetPaygates', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthGetOptionsPaygates = async (req, res) => {
    try {
        const { id } = req.query;

        const paygate = await Paygate.findById(id)
            .select('id name options')
            .populate({
                path: 'options.userbank_id',
                populate: [
                    { path: 'user_id', select: 'id full_name email' },
                    { path: 'localbank_id', select: 'id full_name sub_name' },
                ],
            });

        if (!paygate) {
            return res.status(404).json({ error: 'Cổng thanh toán này không tồn tại' });
        }

        const data = paygate.options
            .map((option) => {
                const { userbank_id, status, created_at, updated_at } = option;
                const { id, branch, _id: key, user_id: user, account_holder, account_number, localbank_id: localbank } = userbank_id;

                return {
                    id,
                    key,
                    user,
                    status,
                    branch,
                    localbank,
                    created_at,
                    updated_at,
                    account_holder,
                    account_number,
                };
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.status(200).json({
            data,
            status: 200,
            title: paygate.name,
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/get.log', 'controlAuthGetOptionsPaygates', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthGetUserbanks = async (req, res) => {
    try {
        const results = await Userbank.find({})
            .select('id user_id localbank_id account_number account_holder status created_at')
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'localbank_id', select: 'id full_name sub_name' })
            .sort({ created_at: -1 });

        const data = results.map((userBank) => {
            const { _id: key, id, user_id: user, localbank_id: localbank, account_number, account_holder, status, created_at } = userBank;

            return {
                id,
                key,
                user,
                status,
                localbank,
                created_at,
                account_number,
                account_holder,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/get.log', 'controlAuthGetUserbanks', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetPaygates, controlAuthGetOptionsPaygates, controlAuthGetUserbanks };
