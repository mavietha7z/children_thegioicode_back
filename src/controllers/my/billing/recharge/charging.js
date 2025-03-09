import md5 from 'md5';
import axios from 'axios';
import { Paygate } from '~/models/paygate';
import { configCreateLog } from '~/configs';
import { Charging } from '~/models/charging';
import { checkStatusCharing } from '~/services/my/recharge/charging';

const controlUserRechargeCharging = async (req, res) => {
    try {
        const { telco, code, serial, amount } = req.body;

        const paygate = await Paygate.findOne({ callback_code: 'recharge_card', status: true })
            .select('name service callback_code discount bonus_point minimum_payment maximum_payment promotion status options')
            .populate({
                path: 'options.userbank_id',
                select: 'id user_id localbank_id account_number account_holder account_password service',
                populate: [
                    { path: 'user_id', select: 'id email full_name' },
                    { path: 'localbank_id', select: 'id full_name sub_name code status interbank_code' },
                ],
            });
        if (!paygate) {
            return res.status(400).json({
                error: 'Cổng thanh toán không tồn tại hoặc đang bảo trì',
            });
        }

        if (amount % 1000 !== 0) {
            return res.status(400).json({
                error: 'Số tiền thanh toán phải là bội của 1,000đ',
            });
        }

        if (amount < paygate.minimum_payment || amount > paygate.maximum_payment) {
            return res.status(400).json({
                error: 'Số tiền thanh toán không hợp lệ',
            });
        }

        let optionPaygate = null;
        for (let option of paygate.options) {
            optionPaygate = option;
            break;
        }
        if (!optionPaygate) {
            return res.status(400).json({
                error: 'Ngân hàng thanh toán không tồn tại',
            });
        }

        const request_id = `${req.user.user_id}${Math.floor(1000 + Math.random() * 9000).toString()}`;

        const dataPost = {
            telco,
            code,
            serial,
            amount,
            request_id,
            partner_id: optionPaygate.userbank_id.account_number,
            sign: md5(optionPaygate.userbank_id.account_holder + code + serial),
            command: 'charging',
        };

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: optionPaygate.userbank_id.account_password,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(dataPost),
            family: 4,
        };

        const result = await axios(config);

        if (!result.data || result.data.status === 102) {
            return res.status(400).json({
                error: 'Đối tác xử lý thẻ đã tắt hoặc không tồn tại',
            });
        }
        if (result.data.status === 3) {
            return res.status(400).json({
                error: 'Thẻ cào sai hoặc đã được xử dụng',
            });
        }
        if (result.data.status === 400) {
            return res.status(400).json({
                error: 'Bạn đã bị chặn do SPAM thẻ cào sai',
            });
        }

        const { status, message, description } = checkStatusCharing(result.data.status, result.data.message);

        const newCharging = await new Charging({
            user_id: req.user.id,
            telco,
            code,
            serial,
            declared_value: amount,
            value: 0,
            amount: 0,
            fees: paygate.discount,
            request_id,
            message,
            description,
            status,
            trans_id: result.data.trans_id,
            approved_at: null,
        }).save();

        const data = {
            code,
            telco,
            serial,
            status,
            message,
            value: 0,
            amount: 0,
            description,
            approved_at: null,
            id: newCharging.id,
            declared_value: amount,
            created_at: Date.now(),
            fees: newCharging.fees,
        };

        res.status(200).json({
            data,
            status: 200,
            message: 'Thẻ cào đang được xử lý vui lòng chờ',
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/recharge/charging.log', 'controlUserRechargeCharging', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserGetChargings = async (req, res) => {
    try {
        const chargings = await Charging.find({ user_id: req.user.id }).sort({ created_at: -1 });

        const data = chargings.map((charging) => {
            return {
                id: charging.id,
                code: charging.code,
                fees: charging.fees,
                value: charging.value,
                telco: charging.telco,
                serial: charging.serial,
                status: charging.status,
                amount: charging.amount,
                message: charging.message,
                created_at: charging.created_at,
                description: charging.description,
                approved_at: charging.approved_at,
                declared_value: charging.declared_value,
            };
        });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/recharge/charging.log', 'controlUserGetChargings', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserRechargeCharging, controlUserGetChargings };
