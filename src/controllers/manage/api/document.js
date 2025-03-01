import { Api } from '~/models/api';
import { configCreateLog } from '~/configs';

const controlAuthGetDocumentApi = async (req, res) => {
    try {
        const { service_id } = req.query;

        const data = await Api.findById(service_id).select('-_id document_html document_text title');

        if (!data) {
            return res.status(404).json({
                error: 'API cần tìm không tồn tại',
            });
        }

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/document.log', 'controlAuthGetDocumentApi', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlAuthUpdateDocumentApi = async (req, res) => {
    try {
        const { service_id } = req.query;
        const { document_html, document_text } = req.body;

        const api = await Api.findById(service_id);
        if (!api) {
            return res.status(404).json({
                error: 'API cần cập nhật không tồn tại',
            });
        }

        api.document_html = document_html;
        api.document_text = document_text;
        await api.save();

        res.status(200).json({
            status: 200,
            message: `Cập nhật document API #${api.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/api/document.log', 'controlAuthUpdateDocumentApi', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetDocumentApi, controlAuthUpdateDocumentApi };
