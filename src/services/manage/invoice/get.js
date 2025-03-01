import { configCreateLog } from '~/configs';

const serviceAuthGetInvoices = async (invoices = []) => {
    try {
        return invoices.map((invoice) => {
            const {
                id,
                type,
                status,
                currency,
                products,
                _id: key,
                user_bank,
                local_bank,
                created_at,
                pay_method,
                updated_at,
                expired_at,
                total_price,
                description,
                bonus_point,
                processed_at,
                total_payment,
                user_id: user,
                recurring_type,
            } = invoice;

            return {
                id,
                key,
                user,
                type,
                status,
                currency,
                products,
                user_bank,
                local_bank,
                created_at,
                expired_at,
                pay_method,
                updated_at,
                description,
                total_price,
                bonus_point,
                processed_at,
                total_payment,
                recurring_type,
            };
        });
    } catch (error) {
        configCreateLog('services/manage/invoice/get.log', 'serviceAuthGetInvoices', error.message);

        return [];
    }
};

export { serviceAuthGetInvoices };
