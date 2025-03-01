const validateV2FreeFire = (req, res, next) => {
    const { account_id } = req.body;

    if (!account_id || account_id.length < 7 || account_id.length > 11) {
        return res.status(400).json({
            error: 'ID người chơi không hợp lệ',
        });
    }

    next();
};

export { validateV2FreeFire };
