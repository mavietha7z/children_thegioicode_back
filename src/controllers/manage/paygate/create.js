import { Paygate } from '~/models/paygate';
import { configCreateLog } from '~/configs';
import { Userbank } from '~/models/userbank';
import { isValidMongoId } from '~/validators';

const controlAuthCreatePaygate = async (req, res) => {
    try {
        const {
            name,
            service,
            vat_tax,
            question,
            logo_url,
            promotion,
            bonus_point,
            description,
            callback_code,
            minimum_payment,
            maximum_payment,
        } = req.body;

        const newPaygate = await new Paygate({
            name,
            service,
            vat_tax,
            question,
            logo_url,
            promotion,
            description,
            bonus_point,
            callback_code,
            minimum_payment,
            maximum_payment,
        }).save();

        const data = {
            name,
            service,
            vat_tax,
            logo_url,
            question,
            promotion,
            description,
            bonus_point,
            minimum_payment,
            maximum_payment,
            id: newPaygate.id,
            key: newPaygate._id,
            status: newPaygate.status,
            created_at: newPaygate.created_at,
            updated_at: newPaygate.updated_at,
            callback_code: newPaygate.callback_code,
            option_count: newPaygate.options.length,
        };

        res.status(200).json({
            data,
            status: 200,
            message: 'Thêm mới cổng thanh toán thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/create.log', 'controlAuthCreatePaygate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthCreateOptionPaygate = async (req, res) => {
    try {
        const { userbank_id, paygate_id } = req.body;

        if (!isValidMongoId(userbank_id) || !isValidMongoId(paygate_id)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const userbank = await Userbank.findById(userbank_id)
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'localbank_id', select: 'id full_name sub_name' });
        if (!userbank) {
            return res.status(404).json({ error: 'Không tìm thấy tài khoản thanh toán' });
        }
        const paygate = await Paygate.findById(paygate_id);
        if (!paygate) {
            return res.status(404).json({ error: 'Không tìm thấy cổng thanh toán' });
        }

        const isOption = paygate.options.find((option) => option.userbank_id.toString() === userbank_id);
        if (isOption) {
            return res.status(400).json({ error: 'Tài khoản thanh toán đã tồn tại' });
        }

        const options = {
            userbank_id: userbank._id,
        };

        await paygate.updateOne({ $push: { options }, updated_at: Date.now() });

        const data = {
            id: userbank.id,
            key: userbank_id,
            user: userbank.user_id,
            updated_at: Date.now(),
            created_at: Date.now(),
            branch: userbank.branch,
            status: userbank.status,
            localbank: userbank.localbank_id,
            account_holder: userbank.account_holder,
            account_number: userbank.account_number,
        };

        res.status(200).json({
            status: 200,
            message: 'Thêm mới tài khoản thanh toán thành công',
            data,
        });
    } catch (error) {
        configCreateLog('controllers/manage/paygate/create.log', 'controlAuthCreateOptionPaygate', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthCreatePaygate, controlAuthCreateOptionPaygate };
