import { configCreateLog } from '~/configs';
import { CloudServerImage } from '~/models/cloudServerImage';

const controlUserGetCloudServerImages = async (req, res) => {
    try {
        const images = await CloudServerImage.find({ status: true }).select('id title group code priority image_url status description');

        const data = images.reduce((result, item) => {
            // Kiểm tra xem `group` (tên hệ điều hành) đã tồn tại trong `result` hay chưa
            const existingGroup = result.find((g) => g.title === item.group);

            if (existingGroup) {
                // Nếu đã tồn tại, thêm phiên bản mới vào mảng `versions`
                existingGroup.versions.push({
                    id: item.id,
                    code: item.code,
                    title: item.title,
                    priority: item.priority,
                    description: item.description,
                });
            } else {
                // Nếu chưa tồn tại, tạo một nhóm mới
                result.push({
                    title: item.group,
                    image_url: item.image_url,
                    versions: [
                        {
                            id: item.id,
                            code: item.code,
                            title: item.title,
                            priority: item.priority,
                            description: item.description,
                        },
                    ],
                });
            }

            return result;
        }, []);

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/cloudServer/image.log', 'controlUserGetCloudServerImages', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetCloudServerImages };
