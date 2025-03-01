import { Wallet } from '~/models/wallet';
import { convertCurrency } from '~/configs';
import { configCreateLog } from '~/configs';
import { serviceUserCreateNewInvoice } from '~/services/user/createInvoice';

const controlAuthUpdateWalletUser = async (req, res) => {
    try {
        const { id } = req.query;
        const { currency, credit_balance, bonus_balance, status } = req.body;

        if (currency !== 'VND' && currency !== 'USD') {
            return res.status(400).json({
                error: 'Loại tiền tệ ví không hợp lệ',
            });
        }

        if (status !== 'activated' && status !== 'inactivated' && status !== 'deleted') {
            return res.status(400).json({
                error: 'Trạng thái ví không hợp lệ',
            });
        }

        const wallet = await Wallet.findById(id).populate({ path: 'user_id', select: 'id full_name email' });
        if (!wallet) {
            return res.status(404).json({ error: 'Không tìm thấy ví khách hàng' });
        }

        const totalBalance = credit_balance + bonus_balance;
        if (totalBalance === wallet.total_balance) {
            return res.status(400).json({
                error: 'Số dư ví khách hàng không thay đổi',
            });
        }

        const before = wallet.total_balance;
        const after = totalBalance;
        const amount = after - before;
        const type = amount > 0 ? 'deposit' : 'withdraw';

        let description = '';
        if (type === 'deposit') {
            description = `Quản trị viên điều chỉnh số dư +${convertCurrency(amount)} trong ví`;
        } else if (type === 'withdraw') {
            description = `Quản trị viên điều chỉnh số dư ${convertCurrency(amount)} trong ví`;
        }

        // Tạo hoá đơn
        const newInvoice = await serviceUserCreateNewInvoice(
            wallet.user_id._id,
            type,
            'VND',
            'service',
            [
                {
                    title: 'Quản trị viên điều chỉnh số dư',
                    description,
                    unit_price: Math.abs(amount),
                    quantity: 1,
                    fees: 0,
                    cycles: null,
                    discount: 0,
                    total_price: Math.abs(amount),
                },
            ],
            [],
            0,
            amount,
            amount,
            'app_wallet',
            null,
            'Hoá đơn điều chỉnh số dư ví',
            true,
        );
        if (!newInvoice.success) {
            return res.status(400).json({
                error: 'Lỗi xử lý hoá đơn thanh toán',
            });
        }

        wallet.status = status;
        wallet.updated_at = Date.now();
        wallet.notification_sent = false;
        await wallet.save();

        const data = {
            key: id,
            id: wallet.id,
            credit_balance,
            user: wallet.user_id,
            status: wallet.status,
            currency: wallet.currency,
            total_balance: totalBalance,
            expired_at: wallet.expired_at,
            created_at: wallet.created_at,
            updated_at: wallet.updated_at,
            bonus_point: wallet.bonus_point,
            main_balance: wallet.main_balance,
            bonus_balance: wallet.bonus_balance,
            total_withdrawal: wallet.total_withdrawal,
            total_bonus_point: wallet.total_bonus_point,
            total_recharge: wallet.total_recharge + amount,
        };

        res.status(200).json({
            data,
            status: 200,
            message: 'Cập nhật ví người dùng thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/wallet/update.log', 'controlAuthUpdateWalletUser', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateWalletUser };
