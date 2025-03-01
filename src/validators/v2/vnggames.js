const validateV2VngGames = (req, res, next) => {
    const { module, role_id, front_id } = req.body;

    if (!role_id || role_id.length < 2) {
        return res.status(400).json({
            error: 'ID nhân vật không hợp lệ',
        });
    }
    if (!module || (module !== 'quick' && module !== 'role')) {
        return res.status(400).json({
            error: 'Mô-đun truy vấn không hợp lệ',
        });
    }
    if (!front_id) {
        return res.status(400).json({
            error: 'Trò chơi cần đăng nhập không hợp lệ',
        });
    }

    next();
};

export { validateV2VngGames };
