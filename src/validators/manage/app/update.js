const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const validateAuthUpdateInfoApps = (req, res, next) => {
    const { website_status, favicon_url, website_logo_url, backend_logo_url } = req.body;

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

    next();
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
