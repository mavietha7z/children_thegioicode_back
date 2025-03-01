import { configCreateLog } from '~/configs';
import { serviceFetchExportDatabase, serviceModelMapDatabase } from '~/services/manage/database/export';

const controlAuthExportDatabase = async (req, res) => {
    try {
        const collections = req.body;

        let data = {};
        for (const collection of collections) {
            if (serviceModelMapDatabase[collection]) {
                const { model, type } = serviceModelMapDatabase[collection];
                data[collection] = await serviceFetchExportDatabase(model, type);
            } else {
                return res.status(400).json({
                    error: `Truy vấn dữ liệu ${collection} không hợp lệ`,
                });
            }
        }

        res.status(200).json({
            data,
            status: 200,
            message: 'Xuất dữ liệu database thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/database/export.log', 'controlAuthExportDatabase', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthExportDatabase };
