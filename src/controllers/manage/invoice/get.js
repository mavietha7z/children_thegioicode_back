import { Invoice } from '~/models/invoice';
import { configCreateLog } from '~/configs';
import { isValidDataId, isValidMongoId } from '~/validators';
import { serviceAuthGetInvoices } from '~/services/manage/invoice/get';

const controlAuthGetInvoices = async (req, res) => {
    try {
        const { id, invoice_id } = req.query;

        let objectQuery = {};
        if (isValidMongoId(id)) {
            objectQuery._id = id;
        }
        if (isValidDataId(invoice_id)) {
            objectQuery.id = invoice_id;
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await Invoice.countDocuments(objectQuery);
        const pages = Math.ceil(count / pageSize);

        const invoices = await Invoice.find(objectQuery)
            .populate({
                path: 'user_id',
                select: 'id full_name email',
            })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = await serviceAuthGetInvoices(invoices);

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/invoice/get.log', 'controlAuthGetInvoices', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetInvoices };
