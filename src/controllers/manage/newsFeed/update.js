import { configCreateLog } from '~/configs';
import { NewsFeed } from '~/models/newsFeed';

const controlAuthUpdateNewsFeed = async (req, res) => {
    try {
        const { id, type } = req.query;

        if (!['pintop', 'status'].includes(type)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const newsFeed = await NewsFeed.findById(id);

        let data = null;
        let message = '';
        if (type === 'pintop') {
            if (!newsFeed.pin_top) {
                await NewsFeed.updateMany({ pin_top: true }, { $set: { pin_top: false } });

                newsFeed.pin_top = true;
            } else {
                newsFeed.pin_top = false;
            }

            data = newsFeed.pin_top;
            message = 'Bật/Tắt ghim bài viết đầu trang thành công';
        }
        if (type === 'status') {
            newsFeed.status = !newsFeed.status;

            data = newsFeed.pin_top;
            message = 'Bật/Tắt trạng thái bài viết thành công';
        }

        newsFeed.updated_at = Date.now();
        await newsFeed.save();

        res.status(200).json({
            data,
            message,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/newFeed/update.log', 'controlAuthUpdateNewsFeed', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthUpdateNewsFeed };
