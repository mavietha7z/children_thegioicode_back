import { Invoice } from '~/models/invoice';
import { configCreateLog } from '~/configs';

const controlAuthDestroyInvoice = async (req, res) => {
    try {
        const { id } = req.query;

        const invoice = await Invoice.findByIdAndDelete(id);
        if (!invoice) {
            return res.status(404).json({
                error: 'Không tìm thấy hoá đơn cần xoá',
            });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá hoá đơn #${invoice.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/invoice/destroy.log', 'controlAuthDestroyInvoice', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyInvoice };
