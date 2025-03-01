import path from 'path';
import sharp from 'sharp';
import multer from 'multer';
import { configCreateLog } from '~/configs';
import { existsSync, mkdirSync, promises as fsPromises } from 'fs';

// Hàm tạo chuỗi ngẫu nhiên chỉ bao gồm chữ cái
const generateRandomString = (length) => {
    const characters = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';

    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
};

// Hàm tạo tên tệp duy nhất
const generateUniqueFileName = async (folder, extension, length = 10, maxAttempts = 5) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const fileName = `${generateRandomString(length)}${extension}`;
        const filePath = path.join(folder, fileName);

        try {
            await fsPromises.access(filePath);
            // Nếu không ném lỗi, tệp đã tồn tại, tiếp tục vòng lặp
        } catch (err) {
            if (err.code === 'ENOENT') {
                // Tệp không tồn tại, có thể sử dụng tên này
                return fileName;
            } else {
                // Lỗi khác, ném lỗi lên
                throw err;
            }
        }
    }

    throw new Error('Không thể tạo tên tệp duy nhất sau nhiều lần thử');
};

const storage = multer.memoryStorage();

const upload = multer({ storage });

const controlUploadImage = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            // Bọc upload.single trong Promise
            upload.single('image')(req, res, (err) => {
                if (err) {
                    return reject(
                        res.status(400).json({
                            error: 'Lỗi lưu ảnh khi lấy đường dẫn',
                        }),
                    );
                }

                if (!req.file) {
                    return reject(
                        res.status(400).json({
                            error: 'Vui lòng gửi ảnh cần lấy đường dẫn lên',
                        }),
                    );
                }

                resolve();
            });
        });

        // Đảm bảo thư mục đích tồn tại
        const destinationFolder = path.join(process.cwd(), '/src/assets');
        if (!existsSync(destinationFolder)) {
            mkdirSync(destinationFolder, { recursive: true });
        }

        // Tạo tên tệp đầu ra duy nhất
        const outputFileName = await generateUniqueFileName(destinationFolder, '.png');
        const outputFilePath = path.join(destinationFolder, outputFileName);

        // Sử dụng Sharp để chuyển đổi ảnh từ bộ nhớ và lưu vào đĩa
        await sharp(req.file.buffer).png().toFile(outputFilePath);

        const data = `http://${req.headers.host}/images/${outputFileName}`;

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        if (error.message === 'Không thể tạo tên tệp duy nhất sau nhiều lần thử') {
            return res.status(500).json({ error: 'Không thể tạo tên tệp duy nhất, vui lòng thử lại' });
        }

        configCreateLog('controllers/upload/image.log', 'controlUploadImage', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUploadImage };
