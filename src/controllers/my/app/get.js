import jwt from 'jsonwebtoken';
import { App } from '~/models/app';
import { configCreateLog } from '~/configs';
import { NewsFeed } from '~/models/newsFeed';
import { isValidDataId } from '~/validators';
import { serviceUserVerifyToken } from '~/services/user/token';
import { User } from '~/models/user';

const controlUserGetConfigApps = async (req, res) => {
    try {
        const app = await App.findOne({});
        if (!app) {
            return res.status(404).json({ error: 'Cấu hình website đang bảo trì' });
        }

        const data = {
            contacts: {
                email: app.contacts.email,
                zalo_url: app.contacts.zalo_url,
                website_url: app.contacts.website_url,
                phone_number: app.contacts.phone_number,
                telegram_url: app.contacts.telegram_url,
            },
            favicon_url: app.favicon_url,
            website_status: app.website_status,
            website_status: app.website_status,
            website_logo_url: app.website_logo_url,
        };

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/app/get.log', 'controlUserGetConfigApps', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserGetNewsFeeds = async (req, res) => {
    try {
        const { session_key } = req.cookies;

        const newsFeeds = await NewsFeed.find({ status: true })
            .populate({ path: 'user_id', select: 'id full_name avatar_url' })
            .sort({ created_at: -1 });

        const data = newsFeeds
            .map((newsFeed) => {
                const { id, user_id: user, pin_top, content_html, share_count, comment_count, likes, like_count, created_at } = newsFeed;

                let is_like = false;

                let currentUser = null;
                jwt.verify(session_key, 'jwt-session_key-user', async (error, user) => {
                    currentUser = user;
                });

                if (currentUser) {
                    const isLike = likes.find((like) => like.user_id.toString() === currentUser.id);

                    if (isLike) {
                        is_like = true;
                    }
                }

                return {
                    id,
                    user: {
                        full_name: user.full_name,
                        avatar_url: user.avatar_url,
                    },
                    pin_top,
                    is_like,
                    like_count,
                    created_at,
                    share_count,
                    content_html,
                    comment_count,
                };
            })
            .sort((a, b) => {
                if (b.pin_top && !a.pin_top) return 1;
                if (a.pin_top && !b.pin_top) return -1;
                return 0;
            });

        res.status(200).json({
            data,
            status: 200,
        });
    } catch (error) {
        configCreateLog('controllers/my/app/get.log', 'controlUserGetNewsFeeds', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

const controlUserLikeNewsFeeds = async (req, res) => {
    try {
        const { id } = req.body;

        if (!isValidDataId(id)) {
            return res.status(400).json({ error: 'Tham số truy vấn không hợp lệ' });
        }

        const newsFeed = await NewsFeed.findOne({ id });
        if (!newsFeed) {
            return res.status(404).json({ error: 'Bài viết bạn muốn thả cảm xúc không tồn tại' });
        }

        const userLikeIndex = newsFeed.likes.findIndex((like) => like.user_id.toString() === req.user.id);
        if (userLikeIndex !== -1) {
            newsFeed.likes.splice(userLikeIndex, 1);
            newsFeed.like_count -= 1;
        } else {
            const likes = {
                user_id: req.user.id,
            };
            newsFeed.likes.push(likes);
            newsFeed.like_count += 1;
        }

        await newsFeed.save();

        res.status(200).json({
            status: 200,
            data: userLikeIndex === -1,
        });
    } catch (error) {
        configCreateLog('controllers/my/app/get.log', 'controlUserLikeNewsFeeds', error.message);
        res.status(500).json({ error: 'Lỗi hệ thống vui lòng thử lại sau' });
    }
};

export { controlUserGetConfigApps, controlUserGetNewsFeeds, controlUserLikeNewsFeeds };
