import { configCreateLog } from '~/configs';

const serviceAuthGetWallets = (wallets = []) => {
    try {
        const data = wallets.map((wallet) => {
            const {
                id,
                status,
                _id: key,
                currency,
                created_at,
                expired_at,
                updated_at,
                bonus_point,
                main_balance,
                user_id: user,
                bonus_balance,
                total_balance,
                credit_balance,
                total_recharge,
                total_withdrawal,
                total_bonus_point,
            } = wallet;

            return {
                id,
                key,
                user,
                status,
                currency,
                expired_at,
                created_at,
                updated_at,
                bonus_point,
                main_balance,
                bonus_balance,
                total_balance,
                credit_balance,
                total_recharge,
                total_withdrawal,
                total_bonus_point,
            };
        });

        return data;
    } catch (error) {
        configCreateLog('services/manage/wallet/get.log', 'serviceAuthGetWallets', error.message);

        return [];
    }
};

export { serviceAuthGetWallets };
