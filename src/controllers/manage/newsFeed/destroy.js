import { configCreateLog } from '~/configs';
import { NewsFeed } from '~/models/newsFeed';

const controlAuthDestroyNewsFeed = async (req, res) => {
    try {
        const { id } = req.query;

        const newsFeed = await NewsFeed.findByIdAndDelete(id);
        if (!newsFeed) {
            return res.status(404).json({ error: 'Bài viết không tồn tại' });
        }

        res.status(200).json({
            status: 200,
            message: `Xoá bài viết #${newsFeed.id} thành công`,
        });
    } catch (error) {
        configCreateLog('controllers/manage/newFeed/destroy.log', 'controlAuthDestroyNewsFeed', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthDestroyNewsFeed };
