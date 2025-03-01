import { configCreateLog } from '~/configs';
import { NewsFeed } from '~/models/newsFeed';
import { isValidMongoId } from '~/validators';
import { generateRandomNumber } from '~/configs';

const controlAuthPublishNewsFeed = async (req, res) => {
    try {
        const { id, title, content_text, content_html } = req.body;

        if (!title || !content_text || !content_html) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bài viết' });
        }

        if (id && isValidMongoId(id)) {
            const newsFeed = await NewsFeed.findById(id);
            if (!newsFeed) {
                return res.status(400).json({ error: 'Bài viết cần cập nhật không tồn tại' });
            }

            newsFeed.title = title;
            newsFeed.updated_at = Date.now();
            newsFeed.content_text = content_text;
            newsFeed.content_html = content_html;
            await newsFeed.save();

            return res.status(200).json({
                status: 200,
                message: `Cập nhật bài viết ${newsFeed.id} thành công`,
            });
        }

        const like_count = generateRandomNumber(5, 5);
        const share_count = generateRandomNumber(4, 5);
        const comment_count = generateRandomNumber(3, 3);

        await new NewsFeed({
            user_id: req.user.id,
            title,
            pin_top: false,
            content_text,
            content_html,
            status: false,
            like_count,
            comment_count,
            share_count,
        }).save();

        res.status(200).json({
            status: 200,
            message: 'Tạo bài viết mới thành công',
        });
    } catch (error) {
        configCreateLog('controllers/manage/newFeed/publish.log', 'controlAuthPublishNewsFeed', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthPublishNewsFeed };
