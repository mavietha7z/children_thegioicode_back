import { configCreateLog } from '~/configs';
import { NewsFeed } from '~/models/newsFeed';

const controlAuthGetNewsFeed = async (req, res) => {
    try {
        const { type, id } = req.query;

        if (type) {
            const result = await NewsFeed.findById(id);
            if (!result) {
                return res.status(404).json({
                    error: 'Bài viết cần tìm không tồn tại',
                });
            }

            const data = {
                title: result.title,
                content_text: result.content_text,
                content_html: result.content_html,
            };

            return res.status(200).json({
                data,
                status: 200,
            });
        }

        const pageSize = 20;
        const skip = (req.page - 1) * pageSize;
        const count = await NewsFeed.countDocuments({});
        const pages = Math.ceil(count / pageSize);

        const results = await NewsFeed.find({})
            .populate({ path: 'user_id', select: 'id email full_name' })
            .populate({ path: 'likes.user_id', select: 'id email full_name' })
            .skip(skip)
            .limit(pageSize)
            .sort({ created_at: -1 });

        const data = results.map((result) => {
            const {
                id,
                status,
                pin_top,
                _id: key,
                like_count,
                created_at,
                updated_at,
                share_count,
                content_html,
                content_text,
                comment_count,
                user_id: user,
                title,
            } = result;

            return {
                id,
                key,
                user,
                title,
                status,
                pin_top,
                like_count,
                created_at,
                updated_at,
                share_count,
                content_html,
                content_text,
                comment_count,
            };
        });

        res.status(200).json({
            data,
            pages,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/manage/newFeed/get.log', 'controlAuthGetNewsFeed', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlAuthGetNewsFeed };
