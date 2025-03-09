import { Source } from '~/models/source';
import { Pricing } from '~/models/pricing';
import { configCreateLog } from '~/configs';
import { OrderSource } from '~/models/orderSource';

const controlAuthDestroySource = async (req, res) => {
    try {
        const { id: service_id } = req.query;

        const source = await Source.findByIdAndDelete(service_id);
        if (!source) {
            return res.status(404).json({
                error: 'Không tìm thấy mã nguồn cần xoá',
            });
        }

        await OrderSource.deleteMany({ source_id: service_id });
        await Pricing.deleteMany({ service_id, service_type: 'Source' });

        res.status(200).json({
            status: 200,
            message: `Xoá mã nguồn #${source.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/source/destroy.log', 'controlAuthDestroySource', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthDestroyOrderSource = async (req, res) => {
    try {
        const { id } = req.query;

        const order = await OrderSource.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ error: 'Đơn mã nguồn không tồn tại' });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá đơn mã nguồn #${order.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/source/destroy.log', 'controlAuthDestroyOrderSource', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroySource, controlAuthDestroyOrderSource };
