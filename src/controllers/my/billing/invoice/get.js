import { Invoice } from '~/models/invoice';
import { configCreateLog } from '~/configs';
import { isValidDataId } from '~/validators';

const controlUserGetInvoices = async (req, res) => {
    try {
        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Invoice.countDocuments({ user_id: req.user.id, status: { $in: ['completed', 'pending'] } });
        const pages = Math.ceil(count / pageSize);

        const invoices = await Invoice.find({ user_id: req.user.id, status: { $in: ['completed', 'pending'] } })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const startIndex = (req.page - 1) * pageSize + 1;

        const data = invoices.map((invoice, index) => {
            return {
                id: invoice.id,
                type: invoice.type,
                status: invoice.status,
                index: startIndex + index,
                created_at: invoice.created_at,
                expired_at: invoice.expired_at,
                total_price: invoice.total_price,
                description: invoice.description,
                total_payment: invoice.total_payment,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/invoice.log', 'controlUserGetInvoices', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserGetInvoiceDetail = async (req, res) => {
    try {
        const { invoice_id } = req.params;

        if (!isValidDataId(invoice_id)) {
            return res.status(400).json({
                error: 'Tham số truy vấn không hợp lệ',
            });
        }

        const invoice = await Invoice.findOne({ user_id: req.user.id, id: invoice_id, status: { $in: ['completed', 'pending'] } })
        .populate({
            path: 'userbank_id',
            select: 'localbank_id',
            populate: { path: 'localbank_id', select: 'id full_name sub_name logo_url' },
        });
        if (!invoice) {
            return res.status(404).json({
                error: `Hoá đơn #${invoice_id} không tồn tại`,
            });
        }

        let data = {
            localbank: null,
            type: invoice.type,
            status: invoice.status,
            coupons: invoice.coupons,
            discount: invoice.discount,
            currency: invoice.currency,
            products: invoice.products,
            pay_method: invoice.pay_method,
            created_at: invoice.created_at,
            expired_at: invoice.expired_at,
            bonus_point: invoice.bonus_point,
            total_price: invoice.total_price,
            processed_at: invoice.processed_at,
            total_payment: invoice.total_payment,
            recurring_type: invoice.recurring_type,
        };

        if (invoice.userbank_id) {
            data.localbank = {
                logo_url: invoice.userbank_id.localbank_id.logo_url,
                sub_name: invoice.userbank_id.localbank_id.sub_name,
                full_name: invoice.userbank_id.localbank_id.full_name,
            };
        }

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/billing/invoice/get.log', 'controlUserGetInvoiceDetail', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetInvoices, controlUserGetInvoiceDetail };
