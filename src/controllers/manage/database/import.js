import path from 'path';
import { configCreateLog } from '~/configs';
import { existsSync, mkdirSync, readFile } from 'fs';

const controlAuthImportDatabase = async (req, res) => {
    try {
        const { collection } = req.query;

        if (!['BonusPoints', 'NewsFeeds']) {
            return res.status(400).json({ error: 'Tham số collection không hợp lệ' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Không có dữ liệu được gửi lên' });
        }

        // Đảm bảo thư mục chứa file tồn tại, nếu không thì tạo mới
        const destinationFolder = path.join(process.cwd(), 'src', 'files');
        if (!existsSync(destinationFolder)) {
            mkdirSync(destinationFolder, { recursive: true });
        }

        // Đặt đường dẫn tệp
        const filePath = path.join(destinationFolder, `${req.file.filename}`);
        readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Đọc file dữ liệu gửi lên thất bại' });
            }

            try {
                const jsonData = JSON.parse(data);

                for (const data of jsonData) {
                    // BonusPoints
                    if (collection === 'BonusPoints') {
                    }

                    // NewsFeeds
                    if (collection === 'NewsFeeds') {
                    }
                }

                res.status(200).json({
                    status: 200,
                    message: 'Nhập dữ liệu database thành công',
                });
            } catch (error) {
                return res.status(500).json({ error: 'Dữ liệu trong file không hợp lệ' });
            }
        });
    } catch (error) {
        configCreateLog('controllers/manage/database/import.log', 'controlAuthImportDatabase', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthImportDatabase };
