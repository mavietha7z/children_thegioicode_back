const phoneRegex = /^0\d{9}$/;
const zaloRegex = /^https:\/\/zalo\.me\/.*/;
const telegramRegex = /^https:\/\/t\.me\/.*/;
const twitterRegex = /^https:\/\/x\.com\/.*/;
const tiktokRegex = /^https:\/\/www\.tiktok\.com\/@.*/;
const youtubeRegex = /^https:\/\/www\.youtube\.com\/@.*/;
const facebookRegex = /^https:\/\/www\.facebook\.com\/.*/;
const instagramRegex = /^https:\/\/www\.instagram\.com\/.*/;
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const websiteRegex = /^(https?:\/\/)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+.*$/;

const validateAuthUpdateInfoApps = (req, res, next) => {
    const { contacts, website_status, favicon_url, website_logo_url, backend_logo_url } = req.body;

    if (!website_logo_url) {
        return res.status(400).json({ error: 'Logo website là trường bắt buộc' });
    }
    if (!favicon_url) {
        return res.status(400).json({ error: 'Favicon website là trường bắt buộc' });
    }
    if (!backend_logo_url) {
        return res.status(400).json({ error: 'Logo backend là trường bắt buộc' });
    }
    if (!website_status || !website_status.status) {
        return res.status(400).json({ error: 'Trạng thái website là trường bắt buộc' });
    }

    const { email, facebook_url, instagram_url, phone_number, telegram_url, tiktok_url, twitter_url, website_url, youtube_url, zalo_url } =
        contacts;

    // Function to verify each contact
    const verifyContacts = () => {
        const errors = {};

        if (email && !emailRegex.test(email)) {
            errors.email = 'Địa chỉ email không hợp lệ';
        }

        if (facebook_url && !facebookRegex.test(facebook_url)) {
            errors.facebook_url = 'URL Facebook không hợp lệ';
        }

        if (instagram_url && !instagramRegex.test(instagram_url)) {
            errors.instagram_url = 'URL Instagram không hợp lệ';
        }

        if (phone_number && !phoneRegex.test(phone_number)) {
            errors.phone_number = 'Số điện thoại không hợp lệ';
        }

        if (telegram_url && !telegramRegex.test(telegram_url)) {
            errors.telegram_url = 'URL Telegram không hợp lệ';
        }

        if (tiktok_url && !tiktokRegex.test(tiktok_url)) {
            errors.tiktok_url = 'URL TikTok không hợp lệ';
        }

        if (twitter_url && !twitterRegex.test(twitter_url)) {
            errors.twitter_url = 'URL Twitter không hợp lệ';
        }

        if (website_url && !websiteRegex.test(website_url)) {
            errors.website_url = 'URL Website không hợp lệ';
        }

        if (youtube_url && !youtubeRegex.test(youtube_url)) {
            errors.youtube_url = 'URL YouTube không hợp lệ';
        }

        if (zalo_url && !zaloRegex.test(zalo_url)) {
            errors.zalo_url = 'URL Zalo không hợp lệ';
        }

        return errors;
    };

    const errors = verifyContacts();
    if (Object.keys(errors).length > 0) {
        const error = Object.values(errors);

        return res.status(400).json({ error });
    } else {
        next();
    }
};

const validateAuthUpdateConfigSendMail = (req, res, next) => {
    const { partner, host, port, secure, email, password } = req.body;

    if (!partner) {
        return res.status(400).json({ error: 'Đối tác gửi email là trường bắt buộc' });
    }
    if (!host) {
        return res.status(400).json({ error: 'Máy chủ SMTP là trường bắt buộc' });
    }
    if (!port) {
        return res.status(400).json({ error: 'Cổng SMTP là trường bắt buộc' });
    }
    if (typeof secure !== 'boolean') {
        return res.status(400).json({ error: 'Định dạng bảo mật SMTP không hợp lệ' });
    }
    if (!email) {
        return res.status(400).json({ error: 'Email gửi email là trường bắt buộc' });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Địa chỉ email gửi không hợp lệ' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Mật khẩu email là trường bắt buộc' });
    }

    next();
};

export { validateAuthUpdateInfoApps, validateAuthUpdateConfigSendMail };
